"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var BaseDocument_1 = require("./BaseDocument");
var bson_1 = require("bson");
var util_1 = require("util");
var Repository = /** @class */ (function () {
    /**
     * @param {Type} documentType
     * @param {DocumentManager} documentManager
     */
    function Repository(documentType, documentManager) {
        var _this = this;
        this.documentType = documentType;
        this.documentManager = documentManager;
        documentManager
            .getDb()
            .then(function (db) {
            _this.collection = db.collection(_this.getCollectionName());
        });
    }
    /**
     * @return {string}
     */
    Repository.prototype.getCollectionName = function () {
        return this.documentType._odm.collectionName;
    };
    /**
     * @param {BaseDocument} document
     */
    Repository.prototype.create = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkCollection()];
                    case 1:
                        _a.sent();
                        if (typeof document.preCreate === 'function') {
                            document.preCreate(this);
                        }
                        return [4 /*yield*/, this.collection.insertOne(document.toObject())];
                    case 2:
                        result = _a.sent();
                        if (result.insertedId) {
                            document._id = result.insertedId;
                        }
                        if (typeof document.postCreate === 'function') {
                            document.postCreate(this);
                        }
                        return [2 /*return*/, document];
                }
            });
        });
    };
    /**
     * @param {object} where
     * @param {FindOneOptions} options
     * @returns {Promise}
     */
    Repository.prototype.findOneBy = function (where, options) {
        if (where === void 0) { where = {}; }
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkCollection()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.collection.findOne(where, options)];
                    case 2:
                        result = _a.sent();
                        if (!result) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, this.mapResultProperties(result)];
                }
            });
        });
    };
    /**
     * @param {string | ObjectID} id
     * @param {string[]} populate
     * @param {FindOneOptions} options
     * @returns {Promise}
     */
    Repository.prototype.find = function (id, populate, options) {
        if (populate === void 0) { populate = []; }
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var result, document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkCollection()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.collection.findOne({ _id: id }, options)];
                    case 2:
                        result = _a.sent();
                        if (!result) {
                            return [2 /*return*/, null];
                        }
                        document = this.mapResultProperties(result);
                        if (!populate.length) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.populateOne(document, populate)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, document];
                }
            });
        });
    };
    /**
     * @param {FilterQuery} query
     * @param {FindOneOptions} options
     * @returns {Promise<[]>}
     */
    Repository.prototype.findBy = function (query, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var resultCursor, resultArray, result, _i, resultArray_1, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkCollection()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.collection.find(query, options)];
                    case 2:
                        resultCursor = _a.sent();
                        return [4 /*yield*/, resultCursor.toArray()];
                    case 3:
                        resultArray = _a.sent();
                        if (!resultArray.length) {
                            return [2 /*return*/, []];
                        }
                        result = [];
                        for (_i = 0, resultArray_1 = resultArray; _i < resultArray_1.length; _i++) {
                            item = resultArray_1[_i];
                            this.mapResultProperties(item);
                            result.push(item);
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * @param id
     * @param {FindOneOptions} options
     * @returns {Promise<DeleteWriteOpResultObject>}
     */
    Repository.prototype.delete = function (id, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkCollection()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.collection.deleteOne({ _id: this.getId(id) }, options)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @param {FilterQuery} filter
     * @param {FindOneOptions} options
     * @returns {Promise<DeleteWriteOpResultObject>}
     */
    Repository.prototype.deleteOneBy = function (filter, options) {
        return __awaiter(this, void 0, void 0, function () {
            var document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkCollection()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.collection.findOne(filter)];
                    case 2:
                        document = _a.sent();
                        return [2 /*return*/, this.delete(document)];
                }
            });
        });
    };
    /**
     * @param {FilterQuery} filter
     * @param {FindOneOptions} options
     * @returns {Promise<DeleteWriteOpResultObject>}
     */
    Repository.prototype.deleteManyNative = function (filter, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkCollection()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.collection.deleteMany(filter, options)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @param {BaseDocument|ObjectId|string} id
     * @param {object} updateObject
     * @returns {Promise<UpdateWriteOpResult>}
     */
    Repository.prototype.update = function (id, updateObject) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkCollection()];
                    case 1:
                        _a.sent();
                        updateObject = this.prepareUpdateObject(updateObject);
                        return [4 /*yield*/, this.collection.updateOne({ _id: this.getId(id) }, { $set: updateObject })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @param {FilterQuery} filter
     * @param {object} updateObject
     * @returns {Promise<UpdateWriteOpResult>}
     */
    Repository.prototype.updateOneBy = function (filter, updateObject) {
        return __awaiter(this, void 0, void 0, function () {
            var document;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkCollection()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.collection.findOne(filter)];
                    case 2:
                        document = _a.sent();
                        return [2 /*return*/, this.update(document, updateObject)];
                }
            });
        });
    };
    /**
     * @param {FilterQuery} filter
     * @param {object} updateObject
     * @param {FindOneOptions} options
     * @returns {Promise<UpdateWriteOpResult>}
     */
    Repository.prototype.updateManyNative = function (filter, updateObject, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.checkCollection()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.collection.updateMany(filter, { $set: updateObject }, options)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @param {object} filter
     * @returns {Promise<number>}
     */
    Repository.prototype.count = function (filter) {
        if (filter === void 0) { filter = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.collection.count(filter)];
            });
        });
    };
    /**
     * @param {object} result
     * @returns {BaseDocument}
     */
    Repository.prototype.mapResultProperties = function (result) {
        var document = new this.documentType();
        var resultKeys = Object.keys(result);
        for (var property in document.getOdmProperties()) {
            if (resultKeys.indexOf(property) !== -1) {
                document[property] = result[property];
            }
        }
        var references = document.getOdmReferences() || {};
        for (var _i = 0, _a = Object.keys(references); _i < _a.length; _i++) {
            var referenceKey = _a[_i];
            var reference = references[referenceKey];
            if (reference.referencedField) {
                continue;
            }
            if (resultKeys.indexOf(referenceKey) !== -1) {
                document[referenceKey] = result[referenceKey];
            }
        }
        return document;
    };
    /**
     * @returns {undefined}
     */
    Repository.prototype.checkCollection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // We need to wait until the database is initialized
                    return [4 /*yield*/, this.documentManager.getDb()];
                    case 1:
                        // We need to wait until the database is initialized
                        _a.sent();
                        if (!this.collection) {
                            throw new Error('Collection was not initialized properly');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @param {BaseDocument} document
     * @param {string[]} populate
     * @returns {BaseDocument}
     */
    Repository.prototype.populateOne = function (document, populate) {
        return __awaiter(this, void 0, void 0, function () {
            var odm, references, _i, populate_1, populateProperty, reference, referencedRepository, where, foundReference, foundReferences, referencedDocuments, _a, foundReferences_1, item;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        odm = document._odm || {};
                        references = odm.references || {};
                        _i = 0, populate_1 = populate;
                        _b.label = 1;
                    case 1:
                        if (!(_i < populate_1.length)) return [3 /*break*/, 7];
                        populateProperty = populate_1[_i];
                        if (!references[populateProperty]) {
                            throw new Error("You are trying to populate reference " + populateProperty + " that is not in you model with proper decorator.");
                        }
                        reference = references[populateProperty];
                        referencedRepository = this.documentManager.getRepository(reference.targetDocument);
                        where = {};
                        if (!document._id) {
                            throw new Error("Document identifier is missing. The document must have filled '_id'.");
                        }
                        if (reference['referencedField']) {
                            where[reference['referencedField']] = document._id;
                        }
                        else {
                            if (util_1.isArray(document[populateProperty])) {
                                where['_id'] = { $in: document[populateProperty] };
                            }
                            else {
                                where['_id'] = document[populateProperty];
                            }
                        }
                        if (!(reference.referenceType === 'OneToOne')) return [3 /*break*/, 3];
                        return [4 /*yield*/, referencedRepository.findOneBy(where)];
                    case 2:
                        foundReference = _b.sent();
                        if (foundReference) {
                            document[populateProperty] = new referencedRepository.documentType(foundReference);
                        }
                        return [3 /*break*/, 6];
                    case 3:
                        if (!(reference.referenceType === 'OneToMany')) return [3 /*break*/, 5];
                        return [4 /*yield*/, referencedRepository.findBy(where)];
                    case 4:
                        foundReferences = _b.sent();
                        referencedDocuments = [];
                        for (_a = 0, foundReferences_1 = foundReferences; _a < foundReferences_1.length; _a++) {
                            item = foundReferences_1[_a];
                            referencedDocuments.push(new referencedRepository.documentType(item));
                        }
                        document[populateProperty] = referencedDocuments;
                        return [3 /*break*/, 6];
                    case 5: throw new Error("Unsupported reference type: '" + reference.referenceType + "'. It must be OneToOne or OneToMany");
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/, document];
                }
            });
        });
    };
    /**
     * @param {BaseDocument | ObjectID | string} id
     * @returns {ObjectId}
     */
    Repository.prototype.getId = function (id) {
        if (util_1.isString(id)) {
            return new bson_1.ObjectID(id);
        }
        else if (id instanceof bson_1.ObjectID) {
            return id;
        }
        else if (id instanceof BaseDocument_1.BaseDocument) {
            return id._id;
        }
        else if (util_1.isObject(id)) {
            return id._id;
        }
        throw new Error('Given id is not supported: ' + id);
    };
    /**
     * @param {object} updateObject
     * @returns {object}
     */
    Repository.prototype.prepareUpdateObject = function (updateObject) {
        var result = {};
        for (var _i = 0, _a = Object.keys(updateObject); _i < _a.length; _i++) {
            var key = _a[_i];
            // Filter unknown properties
            if (this.documentType.prototype._odm.references[key]) {
                var reference = this.documentType.prototype._odm.references[key];
                switch (reference.referenceType) {
                    case 'OneToMany':
                        result[key] = this.getEntityIds(updateObject[key]);
                        break;
                    default:
                        throw new Error('Invalid reference type: ' + reference.type);
                }
                continue;
            }
            if (!this.documentType.prototype._odm.properties[key]) {
                continue;
            }
            result[key] = updateObject[key];
        }
        return result;
    };
    /**
     * @param array
     * @return {ObjectId[]|string[]}
     */
    Repository.prototype.getEntityIds = function (array) {
        var result = [];
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var item = array_1[_i];
            if (item._id) {
                result.push(item._id);
            }
        }
        return result;
    };
    return Repository;
}());
exports.Repository = Repository;
