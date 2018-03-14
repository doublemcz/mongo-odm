import { Collection, Db, FindOneOptions } from 'mongodb';
import { BaseDocument } from './BaseDocument';
import { ObjectID } from 'bson';

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
    return this.modelType.prototype.collectionName;
  }

  /**
   * @param {BaseDocument} document
   */
  public async create(document: BaseDocument) {
    this.checkCollection();
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
    this.checkCollection();
    let result = await this.collection.findOne(where, options);
    return this.mapResultProperties(result);
  }

  /**
   * @param {string | ObjectID} id
   * @param {FindOneOptions} options
   * @returns {Promise}
   */
  public async findOneById(id: string | ObjectID, options: FindOneOptions = {}): Promise<T | null> {
    this.checkCollection();
    let result = await this.collection.findOne({_id: id}, options);
    return this.mapResultProperties(result);
  }

  /**
   * @param {FilterQuery} query
   * @param {FindOneOptions} options
   * @returns {Promise<[]>}
   */
  public async findBy(query: any, options: FindOneOptions = {}): Promise<T[]> {
    this.checkCollection();
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
  protected checkCollection() {
    if (!this.collection) {
      throw new Error('Collection has not been initialized yet');
    }
  }

}
