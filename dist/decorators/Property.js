import 'reflect-metadata';
export const Property = (options = {}) => (target, key) => {
    target._odm = target._odm || {};
    target._odm.properties = target._odm.properties || {};
    target._odm.properties[key] = Object.assign({}, options);
};
//# sourceMappingURL=Property.js.map