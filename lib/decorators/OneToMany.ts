export const OneToMany = (options: OneToManyInputInterface = ({} as OneToManyInputInterface)) => (target: any, key: string) => {
  target._odm = target._odm || {};
  target._odm.references = target._odm.references || {};
  target._odm.properties = target._odm.properties || {};

  if (!options.targetDocument) {
    throw new Error(`A 'targetDocument' is missing in @OneToMany properties of '${key}' member in class ${target.constructor.name}`)
  }

  target._odm.references[key] = options;
  target._odm.references[key].referenceType = 'OneToMany';
};

export interface OneToManyInputInterface {
  targetDocument: string,
  referencedField?: string,
}
