"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
exports.Property = (options = {}) => (target, key) => {
    target._odm = target._odm || {};
    target._odm.properties = target._odm.properties || {};
    target._odm.properties[key] = Object.assign({}, options);
};
