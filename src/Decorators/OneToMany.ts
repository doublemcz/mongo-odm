import 'reflect-metadata';

export const OneToMany = (options: any = {}) => (target: any, key: string) => {
  target._odm = target._odm || {};
  target._odm.references = target._odm.references || {};
  if (!options.type) {
    throw new Error(`A 'type' is missing in @OneToMany properties of '${key}' member in class ${target.constructor.name}`)
  }

  target._odm.references[key] = {
    ...options
  };
};
