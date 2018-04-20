import {
  Collection,
  CommonOptions,
  Db,
  DeleteWriteOpResultObject,
  FindOneOptions,
  UpdateWriteOpResult
} from 'mongodb';
import { BaseDocument } from './BaseDocument';
import { ObjectID } from 'bson';
import { DocumentManager } from './DocumentManager';
import { isArray, isObject, isString } from 'util';

export class Repository<T extends BaseDocument> {

  protected collection: Collection;

  /**
   * @param {Type} documentType
   * @param {DocumentManager} documentManager
   */
  public constructor(protected documentType: any, protected documentManager: DocumentManager) {
    documentManager
      .getDb()
      .then((db: Db) => {
        this.collection = db.collection(this.getCollectionName());
      });
  }

  /**
   * @return {string}
   */
  public getCollectionName(): string {
    return this.documentType._odm.collectionName;
  }

  /**
   * @param {string} property
   * @returns {string}
   */
  public canPopulate(property: string) {
    const document =  new this.documentType();
    const references = document.getOdmReferences();

    return !!references[property];
  }

  /**
   * @param {BaseDocument} document
   */
  public async create(document: T | any): Promise<T> {
    await this.checkCollection();

    if (!(document instanceof BaseDocument)) {
      // We got plain object - we need to recreate object with correct instance
      document = new this.documentType(document);
    }

    if (typeof document.preCreate === 'function') {
      document.preCreate(this);
    }

    const filteredObject = this.prepareObjectForSave(document);
    const result = await this.collection.insertOne(filteredObject);
    if (result.insertedId) {
      document._id = result.insertedId;
    }

    if (typeof document.postCreate === 'function') {
      document.postCreate(this);
    }

    return document;
  }

  /**
   * @param {object} where
   * @param {string[]} populate
   * @param {FindOneOptions} options
   * @returns {Promise}
   */
  public async findOneBy(where: any = {}, populate: string[] = [], options: FindOneOptions = {}): Promise<T | null> {
    await this.checkCollection();

    const rawData = await this.collection.findOne<T>(where, options);
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
  public async find(id: string | ObjectID, populate: string[] = [], options: FindOneOptions = {}): Promise<T | null> {
    await this.checkCollection();

    const rawData = await this.collection.findOne<T>({_id: id}, options);
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
  private async processFindOne(rawData: any, populate: string[]): Promise<T> {
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
  public async findBy(query: any, populate: string[] = [], options: FindOneOptions = {}): Promise<T[]> {
    await this.checkCollection();

    // @TODO find out why `find` is @deprecated
    const resultCursor = await this.collection.find<T[]>(query, options);
    const resultArray: any[] = await resultCursor.toArray();
    if (!resultArray.length) {
      return [];
    }

    const result: any[] = [];
    for (let item of resultArray) {
      result.push(this.mapResultProperties(item));
    }

    if (populate.length) {
      await this.populateMany(result, populate);
    }

    return result;
  }

  /**
   * @param id
   * @param {FindOneOptions} options
   * @returns {Promise<DeleteWriteOpResultObject>}
   */
  public async delete(id: Identifier, options?: CommonOptions): Promise<DeleteWriteOpResultObject> {
    await this.checkCollection();

    return await this.collection.deleteOne({_id: this.getId(id)}, options);
  }

  /**
   * @param {FilterQuery} filter
   * @param {FindOneOptions} options
   * @returns {Promise<DeleteWriteOpResultObject>}
   */
  public async deleteOneBy(filter: any, options?: CommonOptions): Promise<DeleteWriteOpResultObject> {
    await this.checkCollection();
    const document = await this.collection.findOne(filter);

    return this.delete(document);
  }

  /**
   * @param {FilterQuery} filter
   * @param {FindOneOptions} options
   * @returns {Promise<DeleteWriteOpResultObject>}
   */
  public async deleteManyNative(filter: any, options?: CommonOptions): Promise<DeleteWriteOpResultObject> {
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
  public async update(idOrObject: Identifier, updateObject: any, populate: string[] = [], updateWriteOpResultOutput: any = {}): Promise<T> {
    await this.checkCollection();
    updateObject = this.prepareObjectForSave(updateObject);

    const objectId = this.getId(idOrObject);
    const updateWriteOpResult = await this.collection.updateOne({_id: objectId}, {$set: updateObject});
    Object.assign(updateWriteOpResultOutput, updateWriteOpResult);
    let foundInstance;
    if (idOrObject instanceof BaseDocument) {
      foundInstance = await this.updateInstanceAfterUpdate(idOrObject, updateObject, populate);
    } else {
      foundInstance = this.find(objectId, populate);
    }

    return foundInstance;
  }

  /**
   * @param {BaseDocument} instance
   * @param {object} updateProperties
   * @param {string[]} populate
   * @returns {Promise<BaseDocument>}
   */
  private async updateInstanceAfterUpdate(instance: any, updateProperties: any, populate: string[]) {
    const references = instance.getOdmReferences();

    for (const property of Object.keys(updateProperties)) {
      if (references[property]) {
        instance = (instance as any);
        // If we passed populated property of a document and we updated reference id, we need to repopulate
        if (!!updateProperties[property] && !!instance[property] && isObject((instance as any)[property]) && !isArray((instance as any)[property])) {
          // TODO add support for Array (populate many)
          if (instance[property]._id && instance[property]._id.toHexString() !== updateProperties[property].toHexString()) {
            // Repopulate due to reference ID changed and already populated object
            instance[property] = updateProperties[property];
            if (populate.indexOf(property) === -1) {
              populate.push(property);
            }
          }

          // The id is the same... so do nothing, we would replace populated property with plain object
        } else {
          // Not populated, just update the reference id
          instance[property] = updateProperties[property];
        }
      } else {
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
  public async updateOneBy(filter: any, updateObject: any): Promise<UpdateWriteOpResult | BaseDocument | null> {
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
  public async updateManyNative(filter: any, updateObject: any, options?: CommonOptions): Promise<UpdateWriteOpResult> {
    await this.checkCollection();

    return await this.collection.updateMany(filter, {$set: updateObject}, options);
  }

  /**
   * @param {object} filter
   * @returns {Promise<number>}
   */
  public async count(filter: any = {}) {
    return this.collection.count(filter);
  }

  /**
   * Returns initialized document with mapped properties
   *
   * @param {object} result
   * @returns {BaseDocument}
   */
  protected mapResultProperties(result: any): T {
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
  protected async checkCollection() {
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
  private async populateOne(document: BaseDocument, populate: string[]): Promise<BaseDocument> {
    const references = document.getOdmReferences();
    for (const populateProperty of populate) {
      if (!references[populateProperty]) {
        throw new Error(`You are trying to populate reference ${populateProperty} that is not in you model with proper decorator.`);
      }

      // You have access to property decorator options here in 'reference'
      const reference = references[populateProperty];
      const referencedRepository = this.documentManager.getRepository(reference.targetDocument);
      const where: any = {};

      if (reference['referencedField']) {
        // You don't own join property - it is in related table
        if (!document._id) {
          throw new Error(`Document identifier is missing. The document must have filled '_id'.`);
        }

        where[reference['referencedField']] = document._id;
      } else {
        // You have related ids in your collection
        if (isArray((document as any)[populateProperty])) {
          where['_id'] = {$in: (document as any)[populateProperty]};
        } else {
          where['_id'] = (document as any)[populateProperty];
        }

        if (isObject(where._id) && where['_id']._id) {
          where['_id'] = where['_id']._id;
        }
      }

      if (reference.referenceType === 'OneToOne') {
        const foundReference = await referencedRepository.findOneBy(where);
        if (foundReference) {
          (document as any)[populateProperty] = new referencedRepository.documentType(foundReference);
        }
      } else if (reference.referenceType === 'OneToMany') {
        const foundReferences = await referencedRepository.findBy(where);
        const referencedDocuments: BaseDocument[] = [];
        for (const item of foundReferences) {
          referencedDocuments.push(new referencedRepository.documentType(item));
        }

        (document as any)[populateProperty] = referencedDocuments;
      } else {
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
  private async populateMany(documents: BaseDocument[], populate: string[]): Promise<BaseDocument[]> {
    if (!documents.length) {
      return documents;
    }

    const odm = documents[0]._odm || {};
    const references = odm.references || {};
    const mappedDocumentsById: any = {};
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
      const where: any = this.createWhereForPopulationFindBy(populateProperty, referencedField, documents);
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
            const documentId = (referencedDocument as any)[referencedField].toHexString();
            mappedDocumentsById[documentId][populateProperty] = referencedDocument;
          });
        } else if (referenceMetadata.referenceType === 'OneToMany') {
          for (const foundReference of referencedDocuments) {
            const documentId = (foundReference as any)[referencedField].toHexString();
            let destination: any = mappedDocumentsById[documentId][populateProperty];
            if (!(destination instanceof ArrayCollection)) {
              destination = mappedDocumentsById[documentId][populateProperty] = new ArrayCollection();
            }

            destination.push(foundReference);
          }
        } else {
          throw new Error(`Unsupported reference type: '${referenceMetadata.referenceType}'. It must be OneToOne or OneToMany`);
        }
      } else {
        // No reference field - join is on our side
        const mappedReferencesById = this.initAndMapById(referencedRepository.documentType, referencedDocuments);
        if (referenceMetadata.referenceType === 'OneToOne') {
          documents.forEach(document => {
            (document as any)[populateProperty] = mappedReferencesById[(document as any)[populateProperty]];
          });
        } else if (referenceMetadata.referenceType === 'OneToMany') {
          documents.forEach(document => {
            if (!(document as any)[populateProperty] || !isArray((document as any)[populateProperty]) || !(document as any)[populateProperty].length) {
              return;
            }

            const newArray = new ArrayCollection();
            (document as any)[populateProperty].forEach((referenceId: ObjectID) => {
              newArray.push(mappedReferencesById[referenceId.toHexString()]);
            });

            (document as any)[populateProperty] = newArray;
          });
        } else {
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
  private createWhereForPopulationFindBy(populateProperty: string, referencedField: string, documents: BaseDocument[]) {
    const where: any = {};
    if (referencedField) {
      // You don't own join property - it is in related table
      where[referencedField] = {$in: documents.map(document => document._id)};
    } else {
      const ids: ObjectID[] = [];
      documents.forEach(document => {
        if (!(document as any)[populateProperty]) {
          return;
        }

        if (isArray((document as any)[populateProperty])) {
          // OneToMany
          (document as any)[populateProperty].forEach((id: ObjectID) => ids.push(id));
        } else {
          // OneToOne
          ids.push((document as any)[populateProperty]);
        }
      });

      if (!ids.length) {
        return where;
      }

      where['_id'] = {$in: ids};
    }

    return where;
  }

  /**
   * @param {Function} documentType
   * @param {any[]} referencedDocuments
   * @return {any}
   */
  private initAndMapById(documentType: any, referencedDocuments: any[]) {
    const mapped: any = {};
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
  protected getId(id: Identifier): ObjectID {
    if (isString(id)) {
      return new ObjectID(id);
    } else if (id instanceof ObjectID) {
      return id;
    } else if (isObject(id)) {
      return (id as any)._id;
    }

    throw new Error('Given id is not supported: ' + id);
  }

  /**
   * @param {object} objectToBeSaved
   * @returns {object}
   */
  private prepareObjectForSave(objectToBeSaved: any) {
    const result: any = {};
    for (const key of Object.keys(objectToBeSaved)) {
      // Filter unknown properties
      if (this.documentType.prototype._odm.references
        && this.documentType.prototype._odm.references[key]) {
        const reference = this.documentType.prototype._odm.references[key];
        switch (reference.referenceType) {
          case 'OneToOne' :
            result[key] = !objectToBeSaved[key] || (isString(objectToBeSaved[key]) && objectToBeSaved[key] === '')
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

  private getEntityIds(array: any) {
    const result: any = [];
    for (const item of array) {
      if (item instanceof ObjectID) {
        result.push(item);
      } else if (item._id) {
        result.push(item._id);
      } else if (item.id) {
        result.push(item.id);
      }
    }

    return result;
  }
}

class ArrayCollection extends Array {
  // Just helper collection
}

export type Identifier = BaseDocument | ObjectID | string;
