import 'reflect-metadata';
export const OneToMany = (options = {}) => (target, key) => {
    target._odm = target._odm || {};
    target._odm.references = target._odm.references || {};
    if (!options.type) {
        throw new Error(`A 'type' is missing in @OneToMany properties of '${key}' member in class ${target.constructor.name}`);
    }
    options.referenceType = 'OneToMany';
    target._odm.references[key] = Object.assign({}, options);
};
//# sourceMappingURL=OneToMany.js.map