import { ObjectId } from 'mongodb';
export declare abstract class BaseDocument {
    _id: ObjectId;
    _odm: OdmInterface;
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
     * @returns {ReferenceInterface[]}
     */
    getOdmReferences(): any;
}
export interface OdmInterface {
    references: any;
    properties: any;
}
export interface ReferenceInterface {
    targetDocument: string;
    referenceType: string;
    referencedField?: string;
}
