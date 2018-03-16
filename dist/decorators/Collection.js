"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @param {object} decoratorOptions
 * @returns {(target: (Function | any)) => Function | any}
 * @constructor
 */
function Collection(decoratorOptions) {
    if (decoratorOptions === void 0) { decoratorOptions = {}; }
    return function (target) {
        target._odm = target._odm || {};
        if (decoratorOptions) {
            Object.assign(target._odm, decoratorOptions);
        }
        if (!target._odm.collectionName) {
            target._odm.collectionName = target.name.toLowerCase();
        }
        return target;
    };
}
exports.Collection = Collection;
