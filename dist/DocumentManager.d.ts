import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import { BaseDocument } from './BaseDocument';
import { Repository } from './Repository';
export declare class DocumentManager {
    protected mongoClient: Promise<MongoClient>;
    private options;
    /** @type {object} Object with Documents extended from BaseDocument */
    protected documents: any;
    /** @type {object} Object with Repositories */
    private repositories;
    /** @type {Promise<Db>} */
    private db;
    /**
     * @param {Promise<Db>} mongoClient
     * @param {DocumentManagerOptions} options
     */
    constructor(mongoClient: Promise<MongoClient>, options: DocumentManagerOptions);
    /**
     * @param {DocumentManagerOptions} options
     * @param {MongoClientOptions} mongoClientOptions
     * @returns {Promise<DocumentManager>}
     */
    static create(options: DocumentManagerOptions, mongoClientOptions?: MongoClientOptions): DocumentManager;
    /**
     * @returns {Promise<Db>}
     */
    getDb(): Promise<Db>;
    /**
     * @returns {Promise<Db>}
     */
    getMongoClient(): Promise<MongoClient>;
    /**
     * @returns {Promise<boolean>}
     */
    isConnected(): Promise<boolean>;
    /**
     * @param {string} name
     * @param {BaseDocument} documentType
     */
    registerDocument(name: string, documentType: BaseDocument): void;
    /**
     * @returns {undefined}
     */
    protected registerDocuments(): void;
    /**
     * @returns {any}
     */
    getRegisteredDocuments(): any;
    /**
     * @param {BaseDocument} type
     */
    getRepository<T extends BaseDocument>(type: any): Repository<T>;
    /**
     * @param {any} type A type of an inherited Document from BaseDocument
     */
    private createRepository<T>(type);
}
export interface DocumentManagerOptions {
    url?: string;
    database?: string;
    documentsDir?: string;
}
