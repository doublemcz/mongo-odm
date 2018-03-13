import { Property } from './Decorators/Property';
import { ObjectID } from 'bson';

export abstract class BaseDocument {

  [key: string]: any;

  protected static collectionName: string;

  /**
   * @param {Object} properties
   */
  public constructor(properties: any = {}) {
    for (const property in properties) {
      this[property] = properties[property];
    }
  }

  @Property()
  public _id: ObjectID;

  /**
   * @returns {ObjectID}
   */
  getId(): ObjectID {
    return this._id;
  }

  /**
   * @returns {string}
   */
  getPlainId(): string {
    return String(this._id);
  }

  /**
   * @returns {object}
   */
  toObject(): any {
    const result: any = {};
    for (let property in this.getProperties()) {
      if (property == '_id') {
        property = 'id';
      }

      result[property] = this[property];
    }

    return result;
  }

  /**
   * @returns {any[]}
   */
  public getProperties() {
    return this.__proto__.__proto__.properties;
  }

}
