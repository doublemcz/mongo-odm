"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
exports.Property = function (options) {
    if (options === void 0) { options = {}; }
    return function (target, key) {
        target._odm = target._odm || {};
        target._odm.properties = target._odm.properties || {};
        target._odm.properties[key] = __assign({}, options);
    };
};
//# sourceMappingURL=Property.js.map