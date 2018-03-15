import { expect } from 'chai';
import 'mocha';
import { userRepository } from './repositories/UserRepository';
import { User } from './documents/User';
import { Log } from './documents/Log';
import { Repository } from '../src/Repository';
import { documentManager } from './core/connection';
import { isArray } from 'util';
import { Car } from './documents/Car';

describe('Repository', () => {

  it('should check collection name', async () => {
    expect(userRepository.getCollectionName()).to.equal('user');
  });

  it('should create document', async () => {
    const user = new User();
    user.fullname = 'Martin Mika';
    await userRepository.create(user);
    expect(user).to.property('fullname', 'Martin Mika');
    expect(String(String(user.id))).be.a('string');
  });

  it('should find document from find one by id', async () => {
    const user = new User({fullName: 'Martin Mika'});
    await userRepository.create(user);
    const foundUser = await userRepository.findOneById(user._id);
    if (foundUser) {
      expect(foundUser.someUserMember).to.equal('Hey!');
    } else {
      throw new Error('findOnById returned nothing');
    }
  });

  it('should check oneToMany', async () => {
    const user = new User({fullName: 'Martin Mika'});
    await userRepository.create(user);
    await documentManager
      .getRepository<Log>(Log)
      .create(new Log({eventType: 1, user: user._id}));

    const foundUser = await userRepository.findOneById(user._id, ['log']);
    if (foundUser && isArray(foundUser.log) && foundUser.log.length) {
      expect(foundUser.log[0].eventType).eq(1);
    } else {
      throw new Error('findOnById didn\'t returned log array at all');
    }
  });

  it('should check oneToOne', async () => {
    const user = await userRepository.create(new User({fullName: 'Martin Mika'}));
    await documentManager
      .getRepository<Car>(Car)
      .create(new Car({brand: 'Skoda', user: user._id}));

    const foundUser = await userRepository.findOneById(user._id, ['car']);
    if (foundUser && foundUser.car) {
      expect(foundUser.car.brand).eq('Skoda');
    } else {
      throw new Error('findOnById didn\'t returned car at all');
    }
  });

  it('should find document from find one', async () => {
    const user = new User({fullName: 'findOneBy'});
    await userRepository.create(user);
    const foundUser = await userRepository.findOneBy({fullName: 'findOneBy'});
    expect(foundUser).to.be.a('object');
  });

  it('should find array of documents from findBy', async () => {
    await userRepository.create(new User({fullName: 'findOne'}));
    await userRepository.create(new User({fullName: 'findOne'}));
    const foundUsers = await userRepository.findBy({fullName: 'findOne'});
    expect(foundUsers.length).to.be.gt(0);
    expect(foundUsers[0].fullName).to.string('findOne');
  });

  it('should delete one document', async () => {
    await userRepository.create(new User({fullName: 'deleteOne'}));
    await userRepository.deleteOne({fullName: 'deleteOne'});
    const foundUser = await userRepository.findOneBy({fullName: 'deleteOne'});
    expect(foundUser).to.be.eq(null);
  });

  it('should delete many document', async () => {
    await userRepository.create(new User({fullName: 'deleteMany'}));
    await userRepository.create(new User({fullName: 'deleteMany'}));
    await userRepository.create(new User({fullName: 'deleteManyNotRemoved'}));
    await userRepository.deleteMany({fullName: 'deleteMany'});
    const foundUsers = await userRepository.findBy({fullName: 'deleteMany'});
    expect(foundUsers).to.be.instanceOf(Array);
    expect(foundUsers.length).to.be.eq(0);
    const foundUser = await userRepository.findOneBy({fullName: 'deleteManyNotRemoved'});
    if (!foundUser) {
      throw new Error('deleteManyNotRemoved is missing, should be there!');
    }
  });

  it('should update document', async () => {
    await userRepository.create(new User({fullName: 'updateOne'}));
    await userRepository.updateOne({fullName: 'updateOne'}, {age: 29});
    const foundUser = await userRepository.findOneBy({fullName: 'updateOne'});
    if (!foundUser) {
      throw new Error('updateOne is missing, should be there!');
    }

    expect(foundUser.age).eq(29);
  });

  it('should update many document', async () => {
    await userRepository.create(new User({fullName: 'updateMany'}));
    await userRepository.create(new User({fullName: 'updateMany'}));
    await userRepository.updateMany({fullName: 'updateMany'}, {age: 29});
    const foundUsers = await userRepository.findBy({fullName: 'updateMany'});
    if (!foundUsers) {
      throw new Error('updateMany is missing, should be there!');
    }

    expect(foundUsers[0].age).eq(29);
  });

});
