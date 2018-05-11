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

  protected mergeOdm() {
    Object.assign(this._odm, (this as any).__proto__.constructor._odm);
  }

  /**
   * @returns {object}
   */
  public toObject(): any {
    const result: any = {};
    const _this = (this as any);
    for (const property in this.getOdmProperties()) {
      result[property] = _this[property];
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
