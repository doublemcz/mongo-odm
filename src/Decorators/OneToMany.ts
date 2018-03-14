export const OneToMany = (options: any = {}) => (target: any, key: string) => {
  target.constructor.prototype.properties = target.constructor.prototype.properties || {};
  target.constructor.prototype.properties[key] = {
    ...options
  };
};