import 'reflect-metadata';

export const Property = (options: any = {}) => (target: any, key: string) => {
  target._odm = target._odm || {};
  target._odm.properties = target._odm.properties || {};
  target._odm.properties[key] = {
    ...options
  };
};
