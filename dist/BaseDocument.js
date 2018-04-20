"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseDocument {
    /**
     * @param {Object} properties
     */
    constructor(properties = {}) {
        const _this = this;
        for (const property of Object.keys(properties)) {
            _this[property] = properties[property];
        }
    }
    /**
     * @returns {object}
     */
    toObject() {
        const result = {};
        const _this = this;
        for (const property in this.getOdmProperties()) {
            result[property] = _this[property];
        }
        return result;
    }
    /**
     * @returns {any[]}
     */
    getOdmProperties() {
        return this._odm ? this._odm.properties : [];
    }
    /**
     * @returns {ReferenceInterface[]}
     */
    getOdmReferences() {
        return this._odm ? this._odm.references : [];
    }
}
exports.BaseDocument = BaseDocument;
