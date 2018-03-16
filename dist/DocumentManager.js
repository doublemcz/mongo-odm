var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MongoClient } from 'mongodb';
import { BaseDocument } from './BaseDocument';
import * as fs from 'fs';
import { Repository } from './Repository';
export class DocumentManager {
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
        return new this(MongoClient.connect(options.url, mongoClientOptions), options);
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
    isConnected() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = yield this.getDb();
            const client = yield this.mongoClient;
            return client.isConnected(db.databaseName);
        });
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
            const content = require(realPath);
            for (const index in content) {
                const document = content[index];
                if (document.prototype instanceof BaseDocument) {
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
        if (this.repositories[type.name]) {
            return this.repositories[type.name];
        }
        return this.createRepository(type);
    }
    /**
     * @param {any} type A type of an inherited Document from BaseDocument
     */
    createRepository(type) {
        const repository = new Repository(type, this);
        this.repositories[type.name] = repository;
        return repository;
    }
}
//# sourceMappingURL=DocumentManager.js.map