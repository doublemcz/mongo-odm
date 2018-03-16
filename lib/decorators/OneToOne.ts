import 'reflect-metadata';

export const OneToOne = (options: any = {}) => (target: any, key: string) => {
  target._odm = target._odm || {};
  target._odm.references = target._odm.references || {};

  if (!options.type) {
    throw new Error(`A 'type' is missing in @OneToOne properties of '${key}' member in class ${target.constructor.name}`)
  }

  options.referenceType = 'OneToOne';

  target._odm.references[key] = {
    ...options
  };
};
