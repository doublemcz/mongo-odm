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

  /**
   * @returns {object}
   */
  public toObject(): any {
    const result: any = {};
    for (let property in this.getProperties()) {
      if (property == '_id') {
        result['id'] = this['_id'];
      } else {
        result[property] = this[property];
      }
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
