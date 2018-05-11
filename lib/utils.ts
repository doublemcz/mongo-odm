import * as _ from 'lodash';

export function difference(object: any, base: any) {
  function changes(object: any, base: any) {
    return _.transform(object, function (result: any, value: any, key: any) {
      if (!_.isEqual(value, base[key])) {
        result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
      }
    });
  }

  return changes(object, base);
}