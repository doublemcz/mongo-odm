import { Collection, CommonOptions, DeleteWriteOpResultObject, FindOneOptions, ReplaceOneOptions, UpdateWriteOpResult } from 'mongodb';
import { BaseDocument } from './BaseDocument';
import { ObjectID } from 'bson';
import { DocumentManager } from './DocumentManager';
export declare class Repository<T extends BaseDocument> {
    protected modelType: any;
    protected documentManager: DocumentManager;
    protected collection: Collection;
    /**
     * @param {Type} modelType
     * @param {DocumentManager} documentManager
     */
    constructor(modelType: any, documentManager: DocumentManager);
    /**
     * @return {string}
     */
    getCollectionName(): string;
    /**
     * @param {BaseDocument} document
     */
    create(document: BaseDocument): Promise<BaseDocument>;
    /**
     * @param {object} where
     * @param {FindOneOptions} options
     * @returns {Promise}
     */
    findOneBy(where?: any, options?: FindOneOptions): Promise<T | null>;
    /**
     * @param {string | ObjectID} id
     * @param {string[]} populate
     * @param {FindOneOptions} options
     * @returns {Promise}
     */
    find(id: string | ObjectID, populate?: string[], options?: FindOneOptions): Promise<T | null>;
    /**
     * @param {FilterQuery} query
     * @param {FindOneOptions} options
     * @returns {Promise<[]>}
     */
    findBy(query: any, options?: FindOneOptions): Promise<T[]>;
    /**
     * @param id
     * @param {FindOneOptions} options
     * @returns {Promise<DeleteWriteOpResultObject>}
     */
    delete(id: BaseDocument | ObjectID | string, options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
    /**
     * @param {FilterQuery} filter
     * @param {FindOneOptions} options
     * @returns {Promise<DeleteWriteOpResultObject>}
     */
    deleteOneBy(filter: any, options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
    /**
     * @param {FilterQuery} filter
     * @param {FindOneOptions} options
     * @returns {Promise<DeleteWriteOpResultObject>}
     */
    deleteManyNative(filter: any, options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
    /**
     * @param {BaseDocument|ObjectId|string} id
     * @param {object} updateObject
     * @param {FindOneOptions} options
     * @returns {Promise<UpdateWriteOpResult>}
     */
    update(id: BaseDocument | ObjectID | string, updateObject: any, options?: ReplaceOneOptions): Promise<UpdateWriteOpResult>;
    /**
     * @param {FilterQuery} filter
     * @param {object} updateObject
     * @param {FindOneOptions} options
     * @returns {Promise<UpdateWriteOpResult>}
     */
    updateOneBy(filter: any, updateObject: any, options?: ReplaceOneOptions): Promise<UpdateWriteOpResult>;
    /**
     * @param {FilterQuery} filter
     * @param {object} updateObject
     * @param {FindOneOptions} options
     * @returns {Promise<UpdateWriteOpResult>}
     */
    updateManyNative(filter: any, updateObject: any, options?: CommonOptions): Promise<UpdateWriteOpResult>;
    /**
     * @param {object} filter
     * @returns {Promise<number>}
     */
    count(filter?: any): Promise<number>;
    /**
     * @param {object} result
     * @returns {BaseDocument}
     */
    protected mapResultProperties(result: any): T;
    /**
     * @returns {undefined}
     */
    protected checkCollection(): Promise<void>;
    /**
     * @param {BaseDocument} document
     * @param {string[]} populate
     * @returns {BaseDocument}
     */
    private populateOne(document, populate);
    /**
     * @param {BaseDocument | ObjectID | string} id
     * @returns {ObjectId}
     */
    protected getId(id: BaseDocument | ObjectID | string): ObjectID;
}
