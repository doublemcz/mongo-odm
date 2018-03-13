import { expect } from 'chai';
import 'mocha';
import { userRepository } from './repositories/UserRepository';
import { User } from './documents/User';

describe('Repository', () => {

  it('should check collection name', async () => {
    expect(userRepository.getCollectionName()).to.equal('user');
  });

  it('should check document creation', async () => {
    const user = new User();
    user.fullname = "Martin Mika";
    await userRepository.create(user);
    expect(user).to.property('fullname', 'Martin Mika');
  });

  it('should return document from find one by id', async () => {
    const user = new User();
    user.fullname = "Martin Mika";
    await userRepository.create(user);

    const foundUser = await userRepository.findOneById(user.getId());
    if (foundUser) {
      expect(foundUser.someUserMember).to.equal('Hey!');
    } else {
      throw new Error('findOnById returned nothing');
    }
  });

});
