import { expect } from 'chai';
import 'mocha';
import { User } from './documents/User';

describe('Model', () => {

  it('document properties length should be bigger then 0', async () => {
    const user = new User();
    const properties = user.getProperties();
    expect(Object.keys(properties).length).greaterThan(0);
  });

  it('should not contain private fields in toObject', async () => {
    const user = new User();
    expect(Object.keys(user.toObject())).not.contains('privateProperty');
  });

  it('should contain `id` property in toObject', async () => {
    const user = new User();
    expect(Object.keys(user.toObject())).to.contains('id');
  });

});
