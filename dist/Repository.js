var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BaseDocument } from './BaseDocument';
import { ObjectID } from 'bson';
import { isObject, isString } from 'util';
export class Repository {
    /**
     * @param {Type} modelType
     * @param {DocumentManager} documentManager
     */
    constructor(modelType, documentManager) {
        this.modelType = modelType;
        this.documentManager = documentManager;
        documentManager
            .getDb()
            .then((db) => {
            this.collection = db.collection(this.getCollectionName());
        });
    }
    /**
     * @return {string}
     */
    getCollectionName() {
        return this.modelType._odm.collectionName;
    }
    /**
     * @param {BaseDocument} document
     */
    create(document) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkCollection();
            if (typeof document.preCreate === 'function') {
                document.preCreate(this);
            }
            const result = yield this.collection.insertOne(document.toObject());
            if (result.insertedId) {
                document._id = result.insertedId;
            }
            if (typeof document.postCreate === 'function') {
                document.postCreate(this);
            }
            return document;
        });
    }
    /**
     * @param {object} where
     * @param {FindOneOptions} options
     * @returns {Promise}
     */
    findOneBy(where = {}, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkCollection();
            const result = yield this.collection.findOne(where, options);
            if (!result) {
                return null;
            }
            return this.mapResultProperties(result);
        });
    }
    /**
     * @param {string | ObjectID} id
     * @param {string[]} populate
     * @param {FindOneOptions} options
     * @returns {Promise}
     */
    find(id, populate = [], options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkCollection();
            const result = yield this.collection.findOne({ _id: id }, options);
            if (!result) {
                return null;
            }
            const document = this.mapResultProperties(result);
            if (populate.length) {
                yield this.populateOne(document, populate);
            }
            return document;
        });
    }
    /**
     * @param {FilterQuery} query
     * @param {FindOneOptions} options
     * @returns {Promise<[]>}
     */
    findBy(query, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkCollection();
            // @TODO find out why `find` is @deprecated
            const resultCursor = yield this.collection.find(query, options);
            const resultArray = yield resultCursor.toArray();
            if (!resultArray.length) {
                return [];
            }
            const result = [];
            for (const item of resultArray) {
                this.mapResultProperties(item);
                result.push(item);
            }
            return result;
        });
    }
    /**
     * @param id
     * @param {FindOneOptions} options
     * @returns {Promise<DeleteWriteOpResultObject>}
     */
    delete(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkCollection();
            return yield this.collection.deleteOne({ _id: this.getId(id) }, options);
        });
    }
    /**
     * @param {FilterQuery} filter
     * @param {FindOneOptions} options
     * @returns {Promise<DeleteWriteOpResultObject>}
     */
    deleteOneBy(filter, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkCollection();
            const document = yield this.collection.findOne(filter);
            return this.delete(document);
        });
    }
    /**
     * @param {FilterQuery} filter
     * @param {FindOneOptions} options
     * @returns {Promise<DeleteWriteOpResultObject>}
     */
    deleteManyNative(filter, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkCollection();
            return yield this.collection.deleteMany(filter, options);
        });
    }
    /**
     * @param {BaseDocument|ObjectId|string} id
     * @param {object} updateObject
     * @param {FindOneOptions} options
     * @returns {Promise<UpdateWriteOpResult>}
     */
    update(id, updateObject, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkCollection();
            return yield this.collection.updateOne({ _id: this.getId(id) }, { $set: updateObject }, options);
        });
    }
    /**
     * @param {FilterQuery} filter
     * @param {object} updateObject
     * @param {FindOneOptions} options
     * @returns {Promise<UpdateWriteOpResult>}
     */
    updateOneBy(filter, updateObject, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkCollection();
            const document = yield this.collection.findOne(filter);
            return this.update(document, updateObject);
        });
    }
    /**
     * @param {FilterQuery} filter
     * @param {object} updateObject
     * @param {FindOneOptions} options
     * @returns {Promise<UpdateWriteOpResult>}
     */
    updateManyNative(filter, updateObject, options) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkCollection();
            return yield this.collection.updateMany(filter, { $set: updateObject }, options);
        });
    }
    /**
     * @param {object} filter
     * @returns {Promise<number>}
     */
    count(filter = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.collection.count(filter);
        });
    }
    /**
     * @param {object} result
     * @returns {BaseDocument}
     */
    mapResultProperties(result) {
        const document = new this.modelType();
        const resultKeys = Object.keys(result);
        for (const property in document.getProperties()) {
            if (resultKeys.indexOf(property) !== -1) {
                document[property] = result[property];
            }
        }
        return document;
    }
    /**
     * @returns {undefined}
     */
    checkCollection() {
        return __awaiter(this, void 0, void 0, function* () {
            // We need to wait until the database is initialized
            yield this.documentManager.getDb();
            if (!this.collection) {
                throw new Error('Collection was not initialized properly');
            }
        });
    }
    /**
     * @param {BaseDocument} document
     * @param {string[]} populate
     * @returns {BaseDocument}
     */
    populateOne(document, populate) {
        return __awaiter(this, void 0, void 0, function* () {
            const odm = document._odm || {};
            const references = odm.references || {};
            for (const populateProperty of populate) {
                if (!references[populateProperty]) {
                    throw new Error(`You are trying to populate reference ${populateProperty} that is not in you model with proper decorator.`);
                }
                // You have access to property decorator options here in 'reference'
                const reference = references[populateProperty];
                const referencedRepository = this.documentManager.getRepository(reference.type);
                const where = {};
                if (!document._id) {
                    throw new Error(`Document identifier is missing. The document must have filled '_id'.`);
                }
                if (!reference['referencedField']) {
                    throw new Error(`Reference referenced field is missing. Specify a 'referencedField' in decorator for '${populateProperty}' in ${document.constructor.name}.`);
                }
                where[reference['referencedField']] = document._id;
                if (reference.referenceType === 'OneToOne') {
                    document[populateProperty] = yield referencedRepository.findOneBy(where);
                }
                else if (reference.referenceType === 'OneToMany') {
                    document[populateProperty] = yield referencedRepository.findBy(where);
                }
                else {
                    throw new Error(`Unsupported reference type: '${reference.referenceType}'. It must be OneToOne or OneToMany`);
                }
            }
            return document;
        });
    }
    /**
     * @param {BaseDocument | ObjectID | string} id
     * @returns {ObjectId}
     */
    getId(id) {
        if (isString(id)) {
            return new ObjectID(id);
        }
        else if (id instanceof ObjectID) {
            return id;
        }
        else if (id instanceof BaseDocument) {
            return id._id;
        }
        else if (isObject(id)) {
            return id._id;
        }
        throw new Error('Given id is not supported: ' + id);
    }
}
//# sourceMappingURL=Repository.js.map