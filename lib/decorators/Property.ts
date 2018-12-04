import 'reflect-metadata';

export const Property = (options: PropertyDecorator = {}) => (target: any, key: string) => {
  target._odm = target._odm || {};
  target._odm.properties = target._odm.properties || {};
  target._odm.properties[key] = {
    ...options
  };
};

export interface PropertyDecorator {
  isPrivate?: boolean;
}
