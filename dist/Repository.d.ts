import { Collection, CommonOptions, DeleteWriteOpResultObject, FindOneOptions, UpdateWriteOpResult } from 'mongodb';
import { BaseDocument } from './BaseDocument';
import { ObjectID } from 'bson';
import { DocumentManager } from './DocumentManager';
export declare class Repository<T extends BaseDocument> {
    protected documentType: any;
    protected documentManager: DocumentManager;
    protected collection: Collection;
    /**
     * @param {Type} documentType
     * @param {DocumentManager} documentManager
     */
    constructor(documentType: any, documentManager: DocumentManager);
    /**
     * @return {string}
     */
    getCollectionName(): string;
    /**
     * @param {string} property
     * @returns {string}
     */
    canPopulate(property: string): boolean;
    /**
     * @param {BaseDocument} document
     */
    create(document: T | any): Promise<T>;
    /**
     * @param {object} where
     * @param {string[]} populate
     * @param {FindOneOptions} options
     * @returns {Promise}
     */
    findOneBy(where?: any, populate?: string[], options?: FindOneOptions): Promise<T | null>;
    /**
     * @param {string | ObjectID} id
     * @param {string[]} populate
     * @param {FindOneOptions} options
     * @returns {Promise}
     */
    find(id: string | ObjectID, populate?: string[], options?: FindOneOptions): Promise<T | null>;
    /**
     *
     * @param rawData
     * @param {string[]} populate
     * @returns {BaseDocument}
     */
    private processFindOne(rawData, populate);
    /**
     * @param {FilterQuery} query
     * @param {string[]} populate
     * @param {FindOneOptions} options
     * @returns {Promise<[]>}
     */
    findBy(query: any, populate?: string[], options?: FindOneOptions): Promise<T[]>;
    /**
     * @param id
     * @param {FindOneOptions} options
     * @returns {Promise<DeleteWriteOpResultObject>}
     */
    delete(id: Identifier, options?: CommonOptions): Promise<DeleteWriteOpResultObject>;
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
     * @param {BaseDocument|ObjectId|string} idOrObject If you pass an instance of BaseDocument you will get it back with updated fields
     * @param {object} updateObject
     * @param {object} updateWriteOpResultOutput
     * @returns {Promise<UpdateWriteOpResult>}
     */
    update(idOrObject: Identifier, updateObject: any, updateWriteOpResultOutput?: any): Promise<T>;
    /**
     * @param {BaseDocument} instance
     * @param {object} updateProperties
     * @returns {Promise<BaseDocument>}
     */
    private updateInstanceAfterUpdate(instance, updateProperties);
    /**
     * @param {FilterQuery} filter
     * @param {object} updateObject
     * @returns {Promise<UpdateWriteOpResult>}
     */
    updateOneBy(filter: any, updateObject: any): Promise<UpdateWriteOpResult | BaseDocument | null>;
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
     * Returns initialized document with mapped properties
     *
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
     * @param {BaseDocument[]} documents
     * @param {string[]} populate
     * @returns {BaseDocument}
     */
    private populateMany(documents, populate);
    /**
     * @param {string} populateProperty
     * @param {string} referencedField
     * @param {BaseDocument[]} documents
     * @return {any}
     */
    private createWhereForPopulationFindBy(populateProperty, referencedField, documents);
    /**
     * @param {Function} documentType
     * @param {any[]} referencedDocuments
     * @return {any}
     */
    private initAndMapById(documentType, referencedDocuments);
    /**
     * @param {Identifier} id
     * @returns {ObjectId}
     */
    protected getId(id: Identifier): ObjectID;
    /**
     * @param {object} objectToBeSaved
     * @returns {object}
     */
    private prepareObjectForSave(objectToBeSaved);
    /**
     * @param array
     * @return {ObjectId[]|string[]}
     */
    private getEntityIds(array);
}
export declare type Identifier = BaseDocument | ObjectID | string;
