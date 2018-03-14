import { expect } from 'chai';
import 'mocha';
import { userRepository } from './repositories/UserRepository';
import { User } from './documents/User';

describe('Repository', () => {

  it('should check collection name', async () => {
    expect(userRepository.getCollectionName()).to.equal('user');
  });

  it('should create document', async () => {
    const user = new User();
    user.fullname = "Martin Mika";
    await userRepository.create(user);
    expect(user).to.property('fullname', 'Martin Mika');
    expect(String(user.getId())).be.a('string');
  });

  it('should find document from find one by id', async () => {
    const user = new User({fullName: "Martin Mika"});
    await userRepository.create(user);

    const foundUser = await userRepository.findOneById(user.getId());
    if (foundUser) {
      expect(foundUser.someUserMember).to.equal('Hey!');
    } else {
      throw new Error('findOnById returned nothing');
    }
  });

  it('should find document from find one', async () => {
    const user = new User({fullName: "findOneBy"});
    await userRepository.create(user);
    const foundUser = await userRepository.findOneBy({fullName: "findOneBy"});
    expect(foundUser).to.be.a('object');
  });

  it('should find array of documents from findBy', async () => {
    await userRepository.create(new User({fullName: 'findOne'}));
    await userRepository.create(new User({fullName: 'findOne'}));
    const foundUsers = await userRepository.findBy({fullName: "findOne"});
    expect(foundUsers.length).to.be.gt(0);
    expect(foundUsers[0].fullName).to.string('findOne');
  });

  it('should delete one document', async () => {
    await userRepository.create(new User({fullName: 'deleteOne'}));
    await userRepository.deleteOne({fullName: "deleteOne"});
    const foundUser = await userRepository.findOneBy({fullName: "deleteOne"});
    expect(foundUser).to.be.eq(null);
  });

  it('should delete many document', async () => {
    await userRepository.create(new User({fullName: 'deleteMany'}));
    await userRepository.create(new User({fullName: 'deleteMany'}));
    await userRepository.create(new User({fullName: 'deleteManyNotRemoved'}));
    await userRepository.deleteMany({fullName: "deleteMany"});
    const foundUsers = await userRepository.findBy({fullName: "deleteMany"});
    expect(foundUsers).to.be.instanceOf(Array);
    expect(foundUsers.length).to.be.eq(0);
    const foundUser = await userRepository.findOneBy({fullName: "deleteManyNotRemoved"});
    if (!foundUser) {
      throw new Error('deleteManyNotRemoved is missing, should be there!');
    }
  });

});
