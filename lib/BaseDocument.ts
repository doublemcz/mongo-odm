import { ObjectId } from 'mongodb';

export abstract class BaseDocument {

  // @TODO find way how to put @Property here for all inherited objects
  _id: ObjectId;

  public _odm: OdmInterface;
  protected static collectionName: string;

  /**
   * @param {Object} properties
   */
  public constructor(properties: any = {}) {
    const _this = (this as any);
    for (const property of Object.keys(properties)) {
      _this[property] = properties[property];
    }

    this.mergeOdm();
  }

  /**
   * @return {undefined}
   */
  protected mergeOdm() {
    Object.assign(this._odm, (this as any).__proto__.constructor._odm);
  }

  /**
   * @deprecated Use toJSON().
   * @returns {object}
   */
  public toObject(): any {
    // TODO decide what to do with this?
    return this.toJSON();
  }

  /**
   * @return {object}
   */
  public toJSON(): any {
    const result: any = {};
    const _this = (this as any);

    const properties = this.getOdmProperties();
    for (const property in properties) {
      if (properties[property].isPrivate) {
        continue;
      }

      result[property] = _this[property];
    }

    const references = this.getOdmReferences();
    for (const referenceKey of Object.keys(references)) {
      result[referenceKey] = _this[referenceKey];
    }

    return result;
  }

  /**
   * @returns {object[]}
   */
  public getOdmProperties(): any[] {
    return this._odm ? this._odm.properties : [];
  }

  /**
   * @param {string} type
   * @returns {boolean}
   */
  public hasHook(type: string) {
    return this._odm && this._odm.hooks && this._odm.hooks[type];
  }

  /**
   * @returns {object}
   */
  public getOdm(): OdmInterface {
    return this._odm || {};
  }

  /**
   * @returns {ReferenceInterface[]}
   */
  public getOdmReferences() {
    return this._odm ? this._odm.references : [];
  }

  /**
   * @returns {ReferenceInterface[]}
   */
  public getOdmHooks() {
    return this._odm && this._odm.hooks ? this._odm.hooks : [];
  }

}

export interface OdmInterface {
  references: any;
  properties: any;
  hooks: any;
}

export interface ReferenceInterface {
  targetDocument: string,
  referenceType: string
  referencedField?: string,
}
