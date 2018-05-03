"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const BaseDocument_1 = require("./BaseDocument");
const Repository_1 = require("./Repository");
const util_1 = require("util");
const fs = require("fs");
const path = require("path");
class DocumentManager {
    /**
     * @param {Promise<Db>} mongoClient
     * @param {DocumentManagerOptions} options
     */
    constructor(mongoClient, options) {
        this.mongoClient = mongoClient;
        this.options = options;
        /** @type {object} Object with Documents extended from BaseDocument */
        this.documents = {};
        /** @type {object} Object with Repositories */
        this.repositories = {};
        this.registerDocuments();
        const database = options.database;
        if (!database) {
            throw new Error(`You must set 'database' in options`);
        }
        this.db = this.mongoClient.then(mongoClient => mongoClient.db(database));
    }
    /**
     * @param {DocumentManagerOptions} options
     * @param {MongoClientOptions} mongoClientOptions
     * @returns {Promise<DocumentManager>}
     */
    static create(options, mongoClientOptions) {
        if (!options.url) {
            options.url = 'mongodb://localhost';
        }
        if (!options.database) {
            throw new Error(`Please specify 'url' and 'database' in options`);
        }
        return new this(mongodb_1.MongoClient.connect(options.url, mongoClientOptions), options);
    }
    /**
     * @returns {Promise<Db>}
     */
    getDb() {
        return this.db;
    }
    /**
     * @returns {Promise<Db>}
     */
    getMongoClient() {
        return this.mongoClient;
    }
    /**
     * @returns {Promise<boolean>}
     */
    async isConnected() {
        const db = await this.getDb();
        const client = await this.mongoClient;
        return client.isConnected(db.databaseName);
    }
    /**
     * @param {string} name
     * @param {BaseDocument} documentType
     */
    registerDocument(name, documentType) {
        this.documents[name] = documentType;
    }
    /**
     * @returns {undefined}
     */
    registerDocuments() {
        if (!this.options.documentsDir || !fs.existsSync(this.options.documentsDir)) {
            return;
        }
        for (const file of fs.readdirSync(this.options.documentsDir)) {
            const realPath = fs.realpathSync(this.options.documentsDir + '/' + file);
            if (-1 === ['.js', '.ts'].indexOf(path.extname(realPath))) {
                continue;
            }
            const content = require(realPath);
            for (const index in content) {
                const document = content[index];
                if (document.prototype instanceof BaseDocument_1.BaseDocument) {
                    this.registerDocument(document.name, document);
                }
            }
        }
    }
    /**
     * @returns {any}
     */
    getRegisteredDocuments() {
        return this.documents;
    }
    /**
     * @param {BaseDocument} type
     */
    getRepository(type) {
        let identifier;
        if (util_1.isString(type)) {
            identifier = type;
        }
        else if (util_1.isFunction(type)) {
            identifier = type.name;
        }
        else {
            throw new Error(`Invalid type has been passed to getRepository. Given: '${type}'`);
        }
        if (this.repositories[identifier]) {
            return this.repositories[identifier];
        }
        if (!this.documents[identifier]) {
            throw new Error(`There is not such '${identifier}' document. Did you register it? Maybe the documents dir is not valid.`);
        }
        return this.createRepository(this.documents[identifier]);
    }
    /**
     * @param {any} type A type of an inherited Document from BaseDocument
     */
    createRepository(type) {
        let repository;
        const typeInstance = new type();
        if (typeInstance.getOdm().customRepository) {
            // You can pass function or created instance of the repository
            if (typeof typeInstance.getOdm().customRepository === 'object') {
                repository = typeInstance.getOdm().customRepository;
                repository.setDocumentManager(this);
            }
            else if (typeof typeInstance.getOdm().customRepository === 'function') {
                const customClass = typeInstance.getOdm().customRepository;
                repository = new customClass(type, this);
            }
            else {
                throw new Error('Do not know what the repository is. You must give me type or instance');
            }
        }
        else {
            repository = new Repository_1.Repository(type, this);
        }
        this.repositories[type.name] = repository;
        return repository;
    }
}
exports.DocumentManager = DocumentManager;
