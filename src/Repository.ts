import { Collection, CommonOptions, Db, DeleteWriteOpResultObject, FindOneOptions, ReplaceOneOptions, UpdateWriteOpResult } from 'mongodb';
import { BaseDocument } from './BaseDocument';
import { ObjectID } from 'bson';
import { isObject } from 'util';

export class Repository<T extends BaseDocument> {

  protected collection: Collection;

  /**
   * @param {Type} modelType
   * @param {Promise<Db>} dbPromise
   */
  public constructor(private modelType: any, private dbPromise: Promise<Db>) {
    dbPromise.then((db: Db) => {
      this.collection = db.collection(this.getCollectionName());
    });
  }

  /**
   * @return {string}
   */
  public getCollectionName(): string {
    return this.modelType._odm.collectionName;
  }

  /**
   * @param {BaseDocument} document
   */
  public async create(document: BaseDocument) {
    await this.checkCollection();

    const result = await this.collection.insertOne(document.toObject());
    if (result.insertedId) {
      document._id = result.insertedId;
    }
  }

  /**
   * @param {object} where
   * @param {FindOneOptions} options
   * @returns {Promise}
   */
  public async findOneBy(where: any = {}, options: FindOneOptions = {}): Promise<T | null> {
    await this.checkCollection();

    let result = await this.collection.findOne<T>(where, options);
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
  public async findOneById(id: string | ObjectID, populate: string[] = [], options: FindOneOptions = {}): Promise<T | null> {
    await this.checkCollection();
    let result = await this.collection.findOne<T>({_id: id}, options);
    if (!result) {
      return null;
    }

    const document = this.mapResultProperties(result);
    if (populate.length) {
      this.populateOne(document, populate);
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
   * @param {FilterQuery} filter
   * @param {FindOneOptions} options
   * @returns {Promise<DeleteWriteOpResultObject>}
   */
  public async deleteOne(filter: any, options?: CommonOptions): Promise<DeleteWriteOpResultObject> {
    await this.checkCollection();

    return await this.collection.deleteOne(filter, options);
  }

  /**
   * @param {FilterQuery} filter
   * @param {FindOneOptions} options
   * @returns {Promise<DeleteWriteOpResultObject>}
   */
  public async deleteMany(filter: any, options?: CommonOptions): Promise<DeleteWriteOpResultObject> {
    await this.checkCollection();

    return await this.collection.deleteMany(filter, options);
  }

  /**
   * @param {FilterQuery} filter
   * @param {object} updateObject
   * @param {FindOneOptions} options
   * @returns {Promise<UpdateWriteOpResult>}
   */
  public async updateOne(filter: any, updateObject: any, options?: ReplaceOneOptions): Promise<UpdateWriteOpResult> {
    await this.checkCollection();

    return await this.collection.updateOne(filter, {$set: updateObject}, options);
  }

  /**
   * @param {FilterQuery} filter
   * @param {object} updateObject
   * @param {FindOneOptions} options
   * @returns {Promise<UpdateWriteOpResult>}
   */
  public async updateMany(filter: any, updateObject: any, options?: CommonOptions): Promise<UpdateWriteOpResult> {
    await this.checkCollection();

    return await this.collection.updateMany(filter, {$set: updateObject}, options);
  }

  /**
   * @param {object} result
   * @returns {BaseDocument}
   */
  protected mapResultProperties(result: any): T {
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
  protected async checkCollection() {
    await this.dbPromise;
    if (!this.collection) {
      throw new Error('Collection has not been initialized yet');
    }
  }

  /**
   * @param {BaseDocument} document
   * @param {string[]} populate
   * @returns {BaseDocument}
   */
  private populateOne(document: BaseDocument, populate: string[]): BaseDocument {
    const odm = document._odm || {};
    const references = odm.references || {};
    for (const populateProperty of populate) {
      if (!references[populateProperty]) {
        throw new Error(`You are trying to populate reference ${populateProperty} that is not in you model with proper decorator.`);
      }
    }

    return document;
  }

}
