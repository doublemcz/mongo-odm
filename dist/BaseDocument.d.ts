import { ObjectId } from 'mongodb';
export declare abstract class BaseDocument {
    [key: string]: any;
    _id: ObjectId;
    protected static collectionName: string;
    /**
     * @param {Object} properties
     */
    constructor(properties?: any);
    /**
     * @returns {object}
     */
    toObject(): any;
    /**
     * @returns {any[]}
     */
    getOdmProperties(): any[];
    /**
     * @returns {any[]}
     */
    getOdmReferences(): any[];
}
