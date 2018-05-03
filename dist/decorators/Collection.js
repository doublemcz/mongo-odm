"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function Collection(decoratorOptions = {}) {
    return function (target) {
        target._odm = target._odm || {};
        if (decoratorOptions) {
            Object.assign(target._odm, decoratorOptions);
        }
        if (!target._odm.collectionName) {
            target._odm.collectionName = createCollectionName(target.name);
        }
        return target;
    };
}
exports.Collection = Collection;
function createCollectionName(name) {
    const first = name.charAt(0).toLowerCase();
    name = first + name.substr(1);
    return name.replace(/(.+?)([A-Z])(.+?)/g, (substring, ...match) => {
        return match[0] + '-' + match[1].toLowerCase() + match[2];
    });
}
