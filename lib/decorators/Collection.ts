/**
 * @param {object} decoratorOptions
 * @returns {(target: (Function | any)) => Function | any}
 * @constructor
 */
export function Collection(decoratorOptions: any = {}) {
  return function (target: Function | any) {
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
