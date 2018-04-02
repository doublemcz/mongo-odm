import { BaseDocument } from '../BaseDocument';
export declare const OneToOne: (options?: OneToOneInputInterface) => (target: BaseDocument, key: string) => void;
export interface OneToOneInputInterface {
    targetDocument: string;
    referencedField?: string;
}
