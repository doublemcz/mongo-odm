import { ObjectId } from 'mongodb';
export declare abstract class BaseDocument {
    _id: ObjectId;
    _odm: OdmInterface;
    protected static collectionName: string;
    /**
     * @param {Object} properties
     */
    constructor(properties?: any);
    protected mergeOdm(): void;
    /**
     * @returns {object}
     */
    toObject(): any;
    /**
     * @returns {object[]}
     */
    getOdmProperties(): any[];
    /**
     * @returns {object}
     */
    getOdm(): OdmInterface;
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
