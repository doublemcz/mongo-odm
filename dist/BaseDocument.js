"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BaseDocument = /** @class */ (function () {
    /**
     * @param {Object} properties
     */
    function BaseDocument(properties) {
        if (properties === void 0) { properties = {}; }
        var _this = this;
        for (var _i = 0, _a = Object.keys(properties); _i < _a.length; _i++) {
            var property = _a[_i];
            _this[property] = properties[property];
        }
    }
    /**
     * @returns {object}
     */
    BaseDocument.prototype.toObject = function () {
        var result = {};
        var _this = this;
        for (var property in this.getProperties()) {
            result[property] = _this[property];
        }
        return result;
    };
    /**
     * @returns {any[]}
     */
    BaseDocument.prototype.getProperties = function () {
        return this._odm.properties;
    };
    return BaseDocument;
}());
exports.BaseDocument = BaseDocument;
