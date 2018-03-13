import { Collection, Db } from 'mongodb';
import { BaseDocument } from './BaseDocument';
import { ObjectID } from 'bson';

export class Repository<T extends BaseDocument> {

  protected collection: Collection;

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
    const result = await this.collection.insertOne(document.toObject());
    if (result.insertedId) {
      document._id = result.insertedId;
    }
  }

  /**
   * @param {object} where
   * @returns {Promise}
   */
  public async findOneBy(where: any = {}): Promise<T | null> {
    let result = await this.collection.findOne(where);
    return this.mapResultProperties(result);
  }

  /**
   * @param {string | ObjectID} id
   * @returns {Promise}
   */
  public async findOneById(id: string | ObjectID): Promise<T | null> {
    let result = await this.collection.findOne({_id: id});
    return this.mapResultProperties(result);
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

}
