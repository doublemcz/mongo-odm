import 'reflect-metadata';

export const OneToOne = (options: any = {}) => (target: any, key: string) => {
  target._odm = target._odm || {};
  target._odm.references = target._odm.references || {};
  target._odm.properties = target._odm.properties || {};

  if (!options.targetDocument) {
    throw new Error(`A 'targetDocument' is missing in @OneToOne properties of '${key}' member in class ${target.constructor.name}`)
  }

  if (!options.referencedField) {
    target._odm.properties[key] = options;
  }

  options.referenceType = 'OneToOne';
  target._odm.references[key] = options;
};
