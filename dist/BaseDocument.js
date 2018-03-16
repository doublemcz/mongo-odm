export class BaseDocument {
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
        for (const property in this.getProperties()) {
            result[property] = _this[property];
        }
        return result;
    }
    /**
     * @returns {any[]}
     */
    getProperties() {
        return this._odm.properties;
    }
}
//# sourceMappingURL=BaseDocument.js.map