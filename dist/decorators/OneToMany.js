"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
exports.OneToMany = function (options) {
    if (options === void 0) { options = {}; }
    return function (target, key) {
        target._odm = target._odm || {};
        target._odm.references = target._odm.references || {};
        target._odm.properties = target._odm.properties || {};
        if (!options.targetDocument) {
            throw new Error("A 'targetDocument' is missing in @OneToMany properties of '" + key + "' member in class " + target.constructor.name);
        }
        options.referenceType = 'OneToMany';
        target._odm.references[key] = options;
    };
};
