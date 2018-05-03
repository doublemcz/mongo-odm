export declare function Collection(decoratorOptions?: CollectionDecorators): (target: any) => any;
export declare type CollectionDecorators = {
    collectionName?: string;
    customRepository?: any;
};
