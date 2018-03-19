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
var mongodb_1 = require("mongodb");
var BaseDocument_1 = require("./BaseDocument");
var fs = require("fs");
var Repository_1 = require("./Repository");
var path = require("path");
var util_1 = require("util");
var DocumentManager = /** @class */ (function () {
    /**
     * @param {Promise<Db>} mongoClient
     * @param {DocumentManagerOptions} options
     */
    function DocumentManager(mongoClient, options) {
        this.mongoClient = mongoClient;
        this.options = options;
        /** @type {object} Object with Documents extended from BaseDocument */
        this.documents = {};
        /** @type {object} Object with Repositories */
        this.repositories = {};
        this.registerDocuments();
        var database = options.database;
        if (!database) {
            throw new Error("You must set 'database' in options");
        }
        this.db = this.mongoClient.then(function (mongoClient) { return mongoClient.db(database); });
    }
    /**
     * @param {DocumentManagerOptions} options
     * @param {MongoClientOptions} mongoClientOptions
     * @returns {Promise<DocumentManager>}
     */
    DocumentManager.create = function (options, mongoClientOptions) {
        if (!options.url) {
            options.url = 'mongodb://localhost';
        }
        if (!options.database) {
            throw new Error("Please specify 'url' and 'database' in options");
        }
        return new this(mongodb_1.MongoClient.connect(options.url, mongoClientOptions), options);
    };
    /**
     * @returns {Promise<Db>}
     */
    DocumentManager.prototype.getDb = function () {
        return this.db;
    };
    /**
     * @returns {Promise<Db>}
     */
    DocumentManager.prototype.getMongoClient = function () {
        return this.mongoClient;
    };
    /**
     * @returns {Promise<boolean>}
     */
    DocumentManager.prototype.isConnected = function () {
        return __awaiter(this, void 0, void 0, function () {
            var db, client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDb()];
                    case 1:
                        db = _a.sent();
                        return [4 /*yield*/, this.mongoClient];
                    case 2:
                        client = _a.sent();
                        return [2 /*return*/, client.isConnected(db.databaseName)];
                }
            });
        });
    };
    /**
     * @param {string} name
     * @param {BaseDocument} documentType
     */
    DocumentManager.prototype.registerDocument = function (name, documentType) {
        this.documents[name] = documentType;
    };
    /**
     * @returns {undefined}
     */
    DocumentManager.prototype.registerDocuments = function () {
        if (!this.options.documentsDir || !fs.existsSync(this.options.documentsDir)) {
            return;
        }
        for (var _i = 0, _a = fs.readdirSync(this.options.documentsDir); _i < _a.length; _i++) {
            var file = _a[_i];
            var realPath = fs.realpathSync(this.options.documentsDir + '/' + file);
            if (-1 === ['.js', '.ts'].indexOf(path.extname(realPath))) {
                continue;
            }
            var content = require(realPath);
            for (var index in content) {
                var document = content[index];
                if (document.prototype instanceof BaseDocument_1.BaseDocument) {
                    this.registerDocument(document.name, document);
                }
            }
        }
    };
    /**
     * @returns {any}
     */
    DocumentManager.prototype.getRegisteredDocuments = function () {
        return this.documents;
    };
    /**
     * @param {BaseDocument} type
     */
    DocumentManager.prototype.getRepository = function (type) {
        var identifier;
        if (util_1.isString(type)) {
            identifier = type;
        }
        else {
            identifier = type.name;
        }
        if (this.repositories[identifier]) {
            return this.repositories[identifier];
        }
        return this.createRepository(this.documents[identifier]);
    };
    /**
     * @param {any} type A type of an inherited Document from BaseDocument
     */
    DocumentManager.prototype.createRepository = function (type) {
        var repository = new Repository_1.Repository(type, this);
        this.repositories[type.name] = repository;
        return repository;
    };
    return DocumentManager;
}());
exports.DocumentManager = DocumentManager;
