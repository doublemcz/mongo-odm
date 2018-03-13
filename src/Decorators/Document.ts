/**
 * @param {object} decoratorOptions
 * @returns {(target: (Function | any)) => Function | any}
 * @constructor
 */
export function Document(decoratorOptions: any) {
  return function (target: Function | any) {
    target.prototype.decoratorOptions = decoratorOptions;
    target.prototype.collectionName = target.prototype.decoratorOptions.collectionMame || target.name.toLowerCase();

    return target;
  }
};
