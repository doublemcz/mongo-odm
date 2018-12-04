import 'reflect-metadata';
export declare const Property: (options?: PropertyDecorator) => (target: any, key: string) => void;
export interface PropertyDecorator {
    isPrivate?: boolean;
}
