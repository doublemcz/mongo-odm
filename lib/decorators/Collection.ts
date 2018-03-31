/**
 * @param {object} decoratorOptions
 * @returns {(target: (Function | any)) => Function | any}
 * @constructor
 */
import { BaseDocument } from '../BaseDocument';

export function Collection(decoratorOptions: any = {}) {
  return function (target: BaseDocument | any) {
    target._odm = target._odm || {};
    if (decoratorOptions) {
      Object.assign(target._odm, decoratorOptions);
    }

    if (!target._odm.collectionName) {
      target._odm.collectionName = target.name.toLowerCase();
    }

    return target;
  }
}
