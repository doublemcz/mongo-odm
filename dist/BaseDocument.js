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
    /**
     * @return {undefined}
     */
    mergeOdm() {
        Object.assign(this._odm, this.__proto__.constructor._odm);
    }
    /**
     * @deprecated Use toJSON().
     * @returns {object}
     */
    toObject() {
        // TODO decide what to do with this?
        return this.toJSON();
    }
    /**
     * @return {object}
     */
    toJSON() {
        const result = {};
        const _this = this;
        const properties = this.getOdmProperties();
        for (const property in properties) {
            if (properties[property].isPrivate) {
                continue;
            }
            result[property] = _this[property];
        }
        const references = this.getOdmReferences();
        for (const referenceKey of Object.keys(references)) {
            result[referenceKey] = _this[referenceKey];
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
