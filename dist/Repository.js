"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const BaseDocument_1 = require("./BaseDocument");
const bson_1 = require("bson");
const util_1 = require("util");
const utils_1 = require("./utils");
class Repository {
    /**
     * @param {Type} documentType
     * @param {DocumentManager} documentManager
     */
    constructor(documentType, documentManager) {
        this.documentType = documentType;
        this.documentManager = documentManager;
        if (documentManager) {
            this.setDocumentManager(documentManager);
        }
    }
    /**
     * @param {DocumentManager} documentManager
     */
    setDocumentManager(documentManager) {
        this.documentManager = documentManager;
        this.documentManager
            .getDb()
            .then((db) => {
            this.collection = db.collection(this.getCollectionName());
        });
    }
    /**
     * @return {string}
     */
    getCollectionName() {
        return this.documentType._odm.collectionName;
    }
    /**
     * @param {string} property
     * @returns {string}
     */
    canPopulate(property) {
        const document = new this.documentType();
        const references = document.getOdmReferences();
        return !!references[property];
    }
    /**
     * @param {BaseDocument} document
     */
    async create(document) {
        await this.checkCollection();
        if (!(document instanceof BaseDocument_1.BaseDocument)) {
            // We got plain object - we need to recreate object with correct instance
            document = new this.documentType(document);
        }
        this.handleHooks(document, 'preCreate');
        const filteredObject = this.prepareObjectForSave(document);
        const result = await this.collection.insertOne(filteredObject);
        if (result.insertedId) {
            document._id = result.insertedId;
        }
        this.handleHooks(document, 'postCreate');
        return document;
    }
    /**
     * @param {BaseDocument} document
     * @param {string} type
     * @param {object} params
     */
    handleHooks(document, type, params = {}) {
        if (document.hasHook(type)) {
            for (const hook of document.getOdmHooks()[type]) {
                document[hook](params);
            }
        }
    }
    /**
     * @param {object} where
     * @param {string[]} populate
     * @param {FindOneOptions} options
     * @returns {Promise}
     */
    async findOneBy(where = {}, populate = [], options = {}) {
        await this.checkCollection();
        where = this.prepareQuery(where);
        const rawData = await this.collection.findOne(where, options);
        if (!rawData) {
            return null;
        }
        return this.processFindOne(rawData, populate);
    }
    /**
     * @param {string | ObjectID} id
     * @param {string[]} populate
     * @param {FindOneOptions} options
     * @returns {Promise}
     */
    async find(id, populate = [], options = {}) {
        await this.checkCollection();
        if (util_1.isString(id) && bson_1.ObjectID.isValid(id)) {
            id = new bson_1.ObjectID(id);
        }
        const rawData = await this.collection.findOne({ _id: id }, options);
        if (!rawData) {
            return null;
        }
        return this.processFindOne(rawData, populate);
    }
    /**
     *
     * @param rawData
     * @param {string[]} populate
     * @returns {BaseDocument}
     */
    async processFindOne(rawData, populate) {
        const document = this.mapResultProperties(rawData);
        if (populate.length) {
            await this.populateOne(document, populate);
        }
        return document;
    }
    /**
     * @param {FilterQuery} query
     * @param {string[]} populate
     * @param {FindOneOptions} options
     * @returns {Promise<[]>}
     */
    async findBy(query, populate = [], options = {}) {
        await this.checkCollection();
        query = this.prepareQuery(query);
        // @TODO find out why `find` is @deprecated
        const resultCursor = await this.collection.find(query, options);
        const resultArray = await resultCursor.toArray();
        if (!resultArray.length) {
            return [];
        }
        const result = [];
        for (const item of resultArray) {
            result.push(this.mapResultProperties(item));
        }
        if (populate.length) {
            await this.populateMany(result, populate);
        }
        return result;
    }
    /**
     * @param idOrObject
     * @param {FindOneOptions} options
     * @returns {Promise<DeleteWriteOpResultObject>}
     */
    async delete(idOrObject, options) {
        await this.checkCollection();
        let document;
        if (idOrObject instanceof BaseDocument_1.BaseDocument) {
            document = idOrObject;
        }
        else {
            document = await this.find(this.getId(idOrObject));
            if (!document) {
                return null;
            }
        }
        this.handleHooks(document, 'preDelete');
        const result = await this.collection.deleteOne({ _id: document._id }, options);
        this.handleHooks(document, 'postDelete');
        return result;
    }
    /**
     * @param {FilterQuery} filter
     * @param {FindOneOptions} options
     * @returns {Promise<DeleteWriteOpResultObject>}
     */
    async deleteOneBy(filter, options) {
        await this.checkCollection();
        const document = await this.collection.findOne(filter);
        return this.delete(document);
    }
    /**
     * @param {FilterQuery} filter
     * @param {FindOneOptions} options
     * @returns {Promise<DeleteWriteOpResultObject>}
     */
    async deleteManyNative(filter, options) {
        await this.checkCollection();
        return await this.collection.deleteMany(filter, options);
    }
    /**
     * @param {BaseDocument|ObjectId|string} idOrObject If you pass an instance of BaseDocument you will get it back with updated fields
     * @param {object} updateObject
     * @param {string[]} populate
     * @param {object} updateWriteOpResultOutput
     * @returns {Promise<UpdateWriteOpResult>}
     */
    async update(idOrObject, updateObject, populate = [], updateWriteOpResultOutput = {}) {
        await this.checkCollection();
        let document = null;
        if (!(idOrObject instanceof BaseDocument_1.BaseDocument)) {
            document = await this.find(this.getId(idOrObject));
        }
        else {
            document = idOrObject;
        }
        if (!document) {
            return null;
        }
        const temp = Object.assign(new this.documentType(), JSON.parse(JSON.stringify(document)));
        for (const key of Object.keys(updateObject)) {
            // Apply requested updates on fetched document
            document[key] = updateObject[key];
        }
        // Apply hooks on document
        this.handleHooks(document, 'preUpdate', { updateObject: updateObject, beforeChange: temp });
        // Compare with temp document what changed in hooks
        const preparedDocument = this.prepareObjectForSave(document);
        const preparedTemp = this.prepareObjectForSave(temp);
        updateObject = utils_1.difference(preparedDocument, preparedTemp);
        if (Object.keys(updateObject).length) {
            const updateWriteOpResult = await this.collection.updateOne({ _id: document._id }, { $set: updateObject });
            Object.assign(updateWriteOpResultOutput, updateWriteOpResult);
        }
        await this.updateInstanceAfterUpdate(document, updateObject, populate);
        this.handleHooks(document, 'postUpdate', updateObject);
        return document;
    }
    /**
     * @param {BaseDocument} instance
     * @param {object} updateProperties
     * @param {string[]} populate
     * @returns {Promise<BaseDocument>}
     */
    async updateInstanceAfterUpdate(instance, updateProperties, populate) {
        const references = instance.getOdmReferences();
        for (const property of Object.keys(updateProperties)) {
            if (references && references[property]) {
                instance = instance;
                // If we passed populated property of a document and we updated reference id, we need to repopulate
                if (!!updateProperties[property] && !!instance[property] && util_1.isObject(instance[property]) && !util_1.isArray(instance[property])) {
                    // TODO add support for Array (populate many)
                    if (instance[property]._id && instance[property]._id.toHexString() !== updateProperties[property].toHexString()) {
                        // Repopulate due to reference ID changed and already populated object
                        instance[property] = updateProperties[property];
                        if (populate.indexOf(property) === -1) {
                            populate.push(property);
                        }
                    }
                    // The id is the same... so do nothing, we would replace populated property with plain object
                }
                else {
                    // Not populated, just update the reference id
                    instance[property] = updateProperties[property];
                }
            }
            else {
                // Common property update
                instance[property] = updateProperties[property];
            }
        }
        await this.populateOne(instance, populate);
        return instance;
    }
    /**
     * @param {FilterQuery} filter
     * @param {object} updateObject
     * @returns {Promise<UpdateWriteOpResult>}
     */
    async updateOneBy(filter, updateObject) {
        await this.checkCollection();
        const document = await this.collection.findOne(filter);
        return this.update(document, updateObject);
    }
    /**
     * @param {FilterQuery} filter
     * @param {object} updateObject
     * @param {FindOneOptions} options
     * @returns {Promise<UpdateWriteOpResult>}
     */
    async updateManyNative(filter, updateObject, options) {
        await this.checkCollection();
        return await this.collection.updateMany(filter, { $set: updateObject }, options);
    }
    /**
     * @param {object} filter
     * @returns {Promise<number>}
     */
    async count(filter = {}) {
        return this.collection.count(filter);
    }
    /**
     * @returns {AggregationCursor<Default>}
     * @param pipeline
     */
    aggregate(pipeline) {
        return this.collection.aggregate(pipeline);
    }
    /**
     * @returns {Collection}
     */
    getCollection() {
        return this.collection;
    }
    /**
     * @param {string} expression A field that should be summarized - field or an expression
     * @param {object} filter
     * @returns {Promise<number>}
     */
    sum(expression, filter = {}) {
        const pipeline = [];
        if (filter) {
            pipeline.push({
                $match: filter
            });
        }
        if (util_1.isString(expression) && !expression.startsWith('$')) {
            expression = '$' + expression;
            pipeline.push({
                $group: {
                    _id: null,
                    result: { $sum: expression }
                }
            });
        }
        else {
            pipeline.push({ $group: expression });
        }
        return new Promise((resolve, reject) => {
            const cursor = this.collection.aggregate(pipeline);
            cursor.next((err, row) => {
                if (err) {
                    return reject(err);
                }
                if (!row) {
                    return resolve(0);
                }
                resolve(row.result);
            });
        });
    }
    /**
     * Returns initialized document with mapped properties
     *
     * @param {object} result
     * @returns {BaseDocument}
     */
    mapResultProperties(result) {
        const document = new this.documentType();
        const resultKeys = Object.keys(result);
        for (const property in document.getOdmProperties()) {
            if (resultKeys.indexOf(property) !== -1) {
                document[property] = result[property];
            }
        }
        const references = document.getOdmReferences() || {};
        for (const referenceKey of Object.keys(references)) {
            const reference = references[referenceKey];
            if (reference.referencedField) {
                continue;
            }
            if (resultKeys.indexOf(referenceKey) !== -1) {
                document[referenceKey] = result[referenceKey];
            }
        }
        return document;
    }
    /**
     * @returns {undefined}
     */
    async checkCollection() {
        if (!this.documentManager) {
            throw new Error('Document manager is not set');
        }
        // We need to wait until the database is initialized
        await this.documentManager.getDb();
        if (!this.collection) {
            throw new Error('Collection was not initialized properly');
        }
    }
    /**
     * @param {BaseDocument} document
     * @param {string[]} populate
     * @returns {BaseDocument}
     */
    async populateOne(document, populate) {
        if (!this.documentManager) {
            throw new Error('Document manager is not set');
        }
        const references = document.getOdmReferences();
        for (const populateProperty of populate) {
            if (!references[populateProperty]) {
                throw new Error(`You are trying to populate reference ${populateProperty} that is not in you model with proper decorator.`);
            }
            // You have access to property decorator options here in 'reference'
            const reference = references[populateProperty];
            const referencedRepository = this.documentManager.getRepository(reference.targetDocument);
            const where = {};
            if (reference['referencedField']) {
                // You don't own join property - it is in related table
                if (!document._id) {
                    throw new Error(`Document identifier is missing. The document must have filled '_id'.`);
                }
                where[reference['referencedField']] = document._id;
            }
            else {
                // You have related ids in your collection
                if (util_1.isArray(document[populateProperty])) {
                    where['_id'] = { $in: document[populateProperty] };
                }
                else {
                    where['_id'] = document[populateProperty];
                }
                if (util_1.isObject(where._id) && where['_id']._id) {
                    where['_id'] = where['_id']._id;
                }
            }
            if (reference.referenceType === 'OneToOne') {
                const foundReference = await referencedRepository.findOneBy(where);
                if (foundReference) {
                    document[populateProperty] = new referencedRepository.documentType(foundReference);
                }
            }
            else if (reference.referenceType === 'OneToMany') {
                const foundReferences = await referencedRepository.findBy(where);
                const referencedDocuments = [];
                for (const item of foundReferences) {
                    referencedDocuments.push(new referencedRepository.documentType(item));
                }
                document[populateProperty] = referencedDocuments;
            }
            else {
                throw new Error(`Unsupported reference type: '${reference.referenceType}'. It must be OneToOne or OneToMany`);
            }
        }
        return document;
    }
    /**
     * @param {BaseDocument[]} documents
     * @param {string[]} populate
     * @returns {BaseDocument}
     */
    async populateMany(documents, populate) {
        if (!this.documentManager) {
            throw new Error('Document manager is not set');
        }
        if (!documents.length) {
            return documents;
        }
        const odm = documents[0]._odm || {};
        const references = odm.references || {};
        const mappedDocumentsById = {};
        documents.forEach(document => {
            mappedDocumentsById[document._id.toHexString()] = document;
        });
        for (const populateProperty of populate) {
            if (!references[populateProperty]) {
                throw new Error(`You are trying to populate reference ${populateProperty} that is not in you model with proper decorator.`);
            }
            // You have access to property decorator options here in 'referenceMetadata'
            const referenceMetadata = references[populateProperty];
            const referencedField = referenceMetadata['referencedField'] || null;
            const referencedRepository = this.documentManager.getRepository(referenceMetadata.targetDocument);
            const where = this.createWhereForPopulationFindBy(populateProperty, referencedField, documents);
            if (!Object.keys(where).length) {
                continue;
            }
            const referencedDocuments = await referencedRepository.findBy(where);
            if (!referencedDocuments.length) {
                continue;
            }
            if (referencedField) {
                if (referenceMetadata.referenceType === 'OneToOne') {
                    referencedDocuments.forEach(referencedDocument => {
                        const documentId = referencedDocument[referencedField].toHexString();
                        mappedDocumentsById[documentId][populateProperty] = referencedDocument;
                    });
                }
                else if (referenceMetadata.referenceType === 'OneToMany') {
                    for (const foundReference of referencedDocuments) {
                        const documentId = foundReference[referencedField].toHexString();
                        let destination = mappedDocumentsById[documentId][populateProperty];
                        if (!(destination instanceof ArrayCollection)) {
                            destination = mappedDocumentsById[documentId][populateProperty] = new ArrayCollection();
                        }
                        destination.push(foundReference);
                    }
                }
                else {
                    throw new Error(`Unsupported reference type: '${referenceMetadata.referenceType}'. It must be OneToOne or OneToMany`);
                }
            }
            else {
                // No reference field - join is on our side
                const mappedReferencesById = this.initAndMapById(referencedRepository.documentType, referencedDocuments);
                if (referenceMetadata.referenceType === 'OneToOne') {
                    documents.forEach(document => {
                        document[populateProperty] = mappedReferencesById[document[populateProperty]];
                    });
                }
                else if (referenceMetadata.referenceType === 'OneToMany') {
                    documents.forEach(document => {
                        if (!document[populateProperty] || !util_1.isArray(document[populateProperty]) || !document[populateProperty].length) {
                            return;
                        }
                        const newArray = new ArrayCollection();
                        document[populateProperty].forEach((referenceId) => {
                            newArray.push(mappedReferencesById[referenceId.toHexString()]);
                        });
                        document[populateProperty] = newArray;
                    });
                }
                else {
                    throw new Error(`Unsupported reference type: '${referenceMetadata.referenceType}'. It must be OneToOne or OneToMany`);
                }
            }
        }
        return documents;
    }
    /**
     * @param {string} populateProperty
     * @param {string} referencedField
     * @param {BaseDocument[]} documents
     * @return {any}
     */
    createWhereForPopulationFindBy(populateProperty, referencedField, documents) {
        const where = {};
        if (referencedField) {
            // You don't own join property - it is in related table
            where[referencedField] = { $in: documents.map(document => document._id) };
        }
        else {
            const ids = [];
            documents.forEach(document => {
                if (!document[populateProperty]) {
                    return;
                }
                if (util_1.isArray(document[populateProperty])) {
                    // OneToMany
                    document[populateProperty].forEach((id) => ids.push(id));
                }
                else {
                    // OneToOne
                    ids.push(document[populateProperty]);
                }
            });
            if (!ids.length) {
                return where;
            }
            where['_id'] = { $in: ids };
        }
        return where;
    }
    /**
     * @param {Function} documentType
     * @param {any[]} referencedDocuments
     * @return {any}
     */
    initAndMapById(documentType, referencedDocuments) {
        const mapped = {};
        referencedDocuments.forEach(referencedData => {
            // Instantiate document with raw data and map it to object by its id
            mapped[referencedData._id.toHexString()] = new documentType(referencedData);
        });
        return mapped;
    }
    /**
     * @param {Identifier} id
     * @returns {ObjectId}
     */
    getId(id) {
        if (util_1.isString(id)) {
            return new bson_1.ObjectID(id);
        }
        else if (id instanceof bson_1.ObjectID) {
            return id;
        }
        else if (util_1.isObject(id)) {
            return id._id;
        }
        throw new Error('Given id is not supported: ' + id);
    }
    /**
     * @param {object} objectToBeSaved
     * @returns {object}
     */
    prepareObjectForSave(objectToBeSaved) {
        const result = {};
        for (const key of Object.keys(objectToBeSaved)) {
            // Filter unknown properties
            if (this.documentType.prototype._odm.references
                && this.documentType.prototype._odm.references[key]) {
                const reference = this.documentType.prototype._odm.references[key];
                switch (reference.referenceType) {
                    case 'OneToOne':
                        result[key] = !objectToBeSaved[key] || (util_1.isString(objectToBeSaved[key]) && objectToBeSaved[key] === '')
                            ? null
                            : this.getId(objectToBeSaved[key]);
                        break;
                    case 'OneToMany':
                        result[key] = this.getEntityIds(objectToBeSaved[key]);
                        break;
                    default:
                        throw new Error('Invalid reference type: ' + reference.referenceType + ' | ' + JSON.stringify(reference));
                }
                continue;
            }
            if (!this.documentType.prototype._odm.properties[key]) {
                continue;
            }
            result[key] = objectToBeSaved[key];
        }
        return result;
    }
    /**
     * @param array
     */
    getEntityIds(array) {
        const result = [];
        for (const item of array) {
            if (item instanceof bson_1.ObjectID) {
                result.push(item);
            }
            else if (item._id) {
                result.push(item._id);
            }
            else if (item.id) {
                result.push(item.id);
            }
        }
        return result;
    }
    /**
     * It helps when someone send there an object instead of _id
     * @param {object} query
     */
    prepareQuery(query) {
        for (const key of Object.keys(query)) {
            if (query[key] instanceof BaseDocument_1.BaseDocument && query[key]._id) {
                query[key] = query[key]._id instanceof mongodb_1.ObjectId ? query[key]._id : new mongodb_1.ObjectId(query[key]._id);
            }
        }
        return query;
    }
}
exports.Repository = Repository;
class ArrayCollection extends Array {
}
