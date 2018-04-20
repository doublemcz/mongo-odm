"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OneToOne = (options = {}) => (target, key) => {
    if (!target._odm.references) {
        target._odm.references = [];
    }
    if (!options.targetDocument) {
        throw new Error(`A 'targetDocument' is missing in @OneToOne properties of '${key}' member in class ${target.constructor.name}`);
    }
    if (!options.referencedField) {
        target._odm.properties = target._odm.properties || {};
        target._odm.properties[key] = options;
    }
    target._odm.references[key] = options;
    target._odm.references[key].referenceType = 'OneToOne';
};
