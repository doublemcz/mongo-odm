import {
  Collection,
  CommonOptions,
  Db,
  DeleteWriteOpResultObject,
  FindOneOptions,
  ReplaceOneOptions,
  UpdateWriteOpResult
} from 'mongodb';
import { BaseDocument } from './BaseDocument';
import { ObjectID } from 'bson';
import { DocumentManager } from './DocumentManager';
import { isArray, isObject, isString } from 'util';
import { forEachChild } from 'typescript/lib/tsserverlibrary';

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
   * @param {BaseDocument} document
   */
  public async create(document: T): Promise<T> {
    await this.checkCollection();

    if (typeof document.preCreate === 'function') {
      document.preCreate(this);
    }

    const result = await this.collection.insertOne(document.toObject());
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
   * @param {FindOneOptions} options
   * @returns {Promise}
   */
  public async findOneBy(where: any = {}, options: FindOneOptions = {}): Promise<T | null> {
    await this.checkCollection();

    const result = await this.collection.findOne<T>(where, options);
    if (!result) {
      return null;
    }

    return this.mapResultProperties(result);
  }

  /**
   * @param {string | ObjectID} id
   * @param {string[]} populate
   * @param {FindOneOptions} options
   * @returns {Promise}
   */
  public async find(id: string | ObjectID, populate: string[] = [], options: FindOneOptions = {}): Promise<T | null> {
    await this.checkCollection();
    const result = await this.collection.findOne<T>({_id: id}, options);
    if (!result) {
      return null;
    }

    const document = this.mapResultProperties(result);
    if (populate.length) {
      await this.populateOne(document, populate);
    }

    return document;
  }

  /**
   * @param {FilterQuery} query
   * @param {FindOneOptions} options
   * @returns {Promise<[]>}
   */
  public async findBy(query: any, options: FindOneOptions = {}): Promise<T[]> {
    await this.checkCollection();

    // @TODO find out why `find` is @deprecated
    const resultCursor = await this.collection.find<T[]>(query, options);
    const resultArray: any[] = await resultCursor.toArray();
    if (!resultArray.length) {
      return [];
    }

    const result: any[] = [];
    for (const item of resultArray) {
      this.mapResultProperties(item);
      result.push(item);
    }

    return result;
  }

  /**
   * @param id
   * @param {FindOneOptions} options
   * @returns {Promise<DeleteWriteOpResultObject>}
   */
  public async delete(id: BaseDocument | ObjectID | string, options?: CommonOptions): Promise<DeleteWriteOpResultObject> {
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
   * @param {BaseDocument|ObjectId|string} id
   * @param {object} updateObject
   * @returns {Promise<UpdateWriteOpResult>}
   */
  public async update(id: BaseDocument | ObjectID | string, updateObject: any): Promise<UpdateWriteOpResult> {
    await this.checkCollection();
    updateObject = this.prepareUpdateObject(updateObject);

    return await this.collection.updateOne({_id: this.getId(id)}, {$set: updateObject});
  }

  /**
   * @param {FilterQuery} filter
   * @param {object} updateObject
   * @returns {Promise<UpdateWriteOpResult>}
   */
  public async updateOneBy(filter: any, updateObject: any): Promise<UpdateWriteOpResult> {
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
    const odm = document._odm || {};
    const references = odm.references || {};
    for (const populateProperty of populate) {
      if (!references[populateProperty]) {
        throw new Error(`You are trying to populate reference ${populateProperty} that is not in you model with proper decorator.`);
      }

      // You have access to property decorator options here in 'reference'
      const reference = references[populateProperty];
      const referencedRepository = this.documentManager.getRepository(reference.targetDocument);
      const where: any = {};
      if (!document._id) {
        throw new Error(`Document identifier is missing. The document must have filled '_id'.`);
      }

      if (reference['referencedField']) {
        where[reference['referencedField']] = document._id;
      } else {
        if (isArray(document[populateProperty])) {
          where['_id'] = {$in: document[populateProperty]};
        } else {
          where['_id'] = document[populateProperty];
        }
      }

      if (reference.referenceType === 'OneToOne') {
        const foundReference = await referencedRepository.findOneBy(where);
        if (foundReference) {
          document[populateProperty] = new referencedRepository.documentType(foundReference);
        }
      } else if (reference.referenceType === 'OneToMany') {
        const foundReferences = await referencedRepository.findBy(where);
        const referencedDocuments: BaseDocument[] = [];
        for (const item of foundReferences) {
          referencedDocuments.push(new referencedRepository.documentType(item));
        }

        document[populateProperty] = referencedDocuments;
      } else {
        throw new Error(`Unsupported reference type: '${reference.referenceType}'. It must be OneToOne or OneToMany`);
      }

    }

    return document;
  }

  /**
   * @param {BaseDocument | ObjectID | string} id
   * @returns {ObjectId}
   */
  protected getId(id: BaseDocument | ObjectID | string): ObjectID {
    if (isString(id)) {
      return new ObjectID(id);
    } else if (id instanceof ObjectID) {
      return id;
    } else if (id instanceof BaseDocument) {
      return id._id;
    } else if (isObject(id)) {
      return (id as any)._id;
    }

    throw new Error('Given id is not supported: ' + id);
  }

  /**
   * @param {object} updateObject
   * @returns {object}
   */
  private prepareUpdateObject(updateObject: any) {
    const result: any = {};
    for (const key of Object.keys(updateObject)) {
      // Filter unknown properties
      if (this.documentType.prototype._odm.references[key]) {
        const reference = this.documentType.prototype._odm.references[key];
        switch (reference.referenceType) {
          case 'OneToMany':
            result[key] = this.getEntityIds(updateObject[key]);
            break;
          default:
            throw new Error('Invalid reference type: ' + reference.type);
        }

        continue;
      }

      if (!this.documentType.prototype._odm.properties[key]) {
        continue;
      }

      result[key] = updateObject[key];
    }

    return result;
  }

  /**
   * @param array
   * @return {ObjectId[]|string[]}
   */
  private getEntityIds(array: any) {
    const result: ObjectID | string[] = [];
    for (const item of array) {
      if (item._id) {
        result.push(item._id);
      }
    }

    return result;
  }
}
