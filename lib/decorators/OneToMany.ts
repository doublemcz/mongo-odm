import 'reflect-metadata';

export const OneToMany = (options: any = {}) => (target: any, key: string) => {
  target._odm = target._odm || {};
  target._odm.references = target._odm.references || {};
  target._odm.properties = target._odm.properties || {};

  if (!options.targetDocument) {
    throw new Error(`A 'targetDocument' is missing in @OneToMany properties of '${key}' member in class ${target.constructor.name}`)
  }

  options.referenceType = 'OneToMany';
  target._odm.references[key] = options;
};
