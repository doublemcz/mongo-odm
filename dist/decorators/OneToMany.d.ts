export declare const OneToMany: (options?: OneToManyInputInterface) => (target: any, key: string) => void;
export interface OneToManyInputInterface {
    targetDocument: string;
    referencedField?: string;
}
