/**
 * @param {object} decoratorOptions
 * @returns {(target: (Function | any)) => Function | any}
 * @constructor
 */
import { BaseDocument } from '../BaseDocument';

export function Collection(decoratorOptions: CollectionDecorators = {}) {
  return function (target: BaseDocument | any) {
    target._odm = target._odm || {};
    if (decoratorOptions) {
      Object.assign(target._odm, decoratorOptions);
    }

    if (!target._odm.collectionName) {
      target._odm.collectionName = createCollectionName(target.name);
    }

    return target;
  }
}

export type CollectionDecorators = {
  collectionName?: string;
}

function createCollectionName(name: string) {
  const first = name.charAt(0).toLowerCase();
  name = first + name.substr(1);
  return name.replace(/(.+?)([A-Z])(.+?)/g, (substring: string, ...match) => {
    return match[0] + '-' + match[1].toLowerCase() + match[2];
  });
}
