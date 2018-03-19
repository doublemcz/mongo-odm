"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
exports.OneToOne = function (options) {
    if (options === void 0) { options = {}; }
    return function (target, key) {
        target._odm = target._odm || {};
        target._odm.references = target._odm.references || {};
        target._odm.properties = target._odm.properties || {};
        if (!options.targetDocument) {
            throw new Error("A 'targetDocument' is missing in @OneToOne properties of '" + key + "' member in class " + target.constructor.name);
        }
        if (!options.referencedField) {
            target._odm.properties[key] = options;
        }
        options.referenceType = 'OneToOne';
        target._odm.references[key] = options;
    };
};
