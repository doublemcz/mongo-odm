import { ObjectId } from 'mongodb';

export abstract class BaseDocument {

  // @TODO find a way how to get rid of this signature
  [key: string]: any;

  // @TODO find way how to put @Property here for all inherited objects
  _id: ObjectId;

  protected static collectionName: string;

  /**
   * @param {Object} properties
   */
  public constructor(properties: any = {}) {
    const _this = (this as any);
    for (const property of Object.keys(properties)) {
      _this[property] = properties[property];
    }
  }

  /**
   * @returns {object}
   */
  public toObject(): any {
    const result: any = {};
    const _this = (this as any);
    for (let property in this.getProperties()) {
      result[property] = _this[property];
    }

    return result;
  }

  /**
   * @returns {any[]}
   */
  public getProperties() {
    return this._odm.properties;
  }

}
