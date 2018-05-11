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
        this.mergeOdm();
    }
    mergeOdm() {
        Object.assign(this._odm, this.__proto__.constructor._odm);
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
     * @returns {object[]}
     */
    getOdmProperties() {
        return this._odm ? this._odm.properties : [];
    }
    /**
     * @param {string} type
     * @returns {boolean}
     */
    hasHook(type) {
        return this._odm && this._odm.hooks && this._odm.hooks[type];
    }
    /**
     * @returns {object}
     */
    getOdm() {
        return this._odm || {};
    }
    /**
     * @returns {ReferenceInterface[]}
     */
    getOdmReferences() {
        return this._odm ? this._odm.references : [];
    }
    /**
     * @returns {ReferenceInterface[]}
     */
    getOdmHooks() {
        return this._odm && this._odm.hooks ? this._odm.hooks : [];
    }
}
exports.BaseDocument = BaseDocument;
