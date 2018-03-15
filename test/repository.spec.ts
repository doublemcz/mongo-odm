import { expect } from 'chai';
import 'mocha';
import { User } from './documents/User';
import { Log } from './documents/Log';
import { Repository } from '../src/Repository';
import { documentManager } from './core/connection';
import { isArray } from 'util';
import { Car } from './documents/Car';


describe('Repository', () => {

  it('should check collection name', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    expect(userRepository.getCollectionName()).to.equal('user');
  });

  it('should create document', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = new User();
    user.fullName = 'Martin Mika';
    await userRepository.create(user);
    expect(user).to.property('fullName', 'Martin Mika');
    expect(String(String(user._id))).be.a('string');
  });

  it('check preCreate hook', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create(new User({fullName: 'Tomas Krejci'}));
    expect(user.createdAt).to.instanceOf(Date);
    expect(String(String(user._id))).be.a('string');
  });

  it('check postCreate hook', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = new User({fullName: 'postCreate'});
    await userRepository.create(user);
    expect(String(String(user.fullName))).be.equal('postCreate Works!');
  });

  it('should find document from find one by id', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = new User({fullName: 'Robert Zaruba'});
    await userRepository.create(user);
    const foundUser = await userRepository.find(user._id);
    if (foundUser) {
      expect(foundUser.someUserMember).to.equal('Hey!');
    } else {
      throw new Error('findOnById returned nothing');
    }
  });

  it('should check oneToMany', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = new User({fullName: 'Filip Stowasser'});
    await userRepository.create(user);
    await documentManager
      .getRepository<Log>(Log)
      .create(new Log({eventType: 1, user: user._id}));

    const foundUser = await userRepository.find(user._id, ['log']);
    if (foundUser && isArray(foundUser.log) && foundUser.log.length) {
      expect(foundUser.log[0].eventType).eq(1);
    } else {
      throw new Error('findOnById didn\'t returned log array at all');
    }
  });

  it('should check oneToOne', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create(new User({fullName: 'Lukas Ruczkowski'}));
    await documentManager
      .getRepository<Car>(Car)
      .create(new Car({brand: 'Skoda', user: user._id}));

    const foundUser = await userRepository.find(user._id, ['car']);
    if (foundUser && foundUser.car) {
      expect(foundUser.car.brand).eq('Skoda');
    } else {
      throw new Error('findOnById didn\'t returned car at all');
    }
  });

  it('should find document from find one', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = new User({fullName: 'findOneBy'});
    await userRepository.create(user);
    const foundUser = await userRepository.findOneBy({fullName: 'findOneBy'});
    expect(foundUser).to.be.a('object');
  });

  it('should find array of documents from findBy', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    await userRepository.create(new User({fullName: 'findOne'}));
    await userRepository.create(new User({fullName: 'findOne'}));
    const foundUsers = await userRepository.findBy({fullName: 'findOne'});
    expect(foundUsers.length).to.be.gt(0);
    expect(foundUsers[0].fullName).to.string('findOne');
  });

  it('should delete one by string id', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create(new User({fullName: 'deleteOneStringId'}));
    await userRepository.delete(user._id.toHexString());
    const foundUser = await userRepository.findOneBy({fullName: 'deleteOneStringId'});
    expect(foundUser).to.be.eq(null);
  });

  it('should delete one by object id', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create(new User({fullName: 'deleteOneObjectId'}));
    await userRepository.delete(user._id);
    const foundUser = await userRepository.findOneBy({fullName: 'deleteOneObjectId'});
    expect(foundUser).to.be.eq(null);
  });

  it('should delete one by document', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create(new User({fullName: 'deleteOneDocument'}));
    await userRepository.delete(user);
    const foundUser = await userRepository.findOneBy({fullName: 'deleteOneDocument'});
    expect(foundUser).to.be.eq(null);
  });

  it('should delete one by where', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    await userRepository.create(new User({fullName: 'deleteOneByWhere'}));
    await userRepository.deleteOneBy({fullName: 'deleteOneByWhere'});
    const foundUser = await userRepository.findOneBy({fullName: 'deleteOneByWhere'});
    expect(foundUser).to.be.eq(null);
  });

  it('should delete many document', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    await userRepository.create(new User({fullName: 'deleteManyNative'}));
    await userRepository.create(new User({fullName: 'deleteManyNative'}));
    await userRepository.create(new User({fullName: 'deleteManyNotRemoved'}));
    await userRepository.deleteManyNative({fullName: 'deleteManyNative'});
    const foundUsers = await userRepository.findBy({fullName: 'deleteManyNative'});
    expect(foundUsers).to.be.instanceOf(Array);
    expect(foundUsers.length).to.be.eq(0);
    const foundUser = await userRepository.findOneBy({fullName: 'deleteManyNotRemoved'});
    if (!foundUser) {
      throw new Error('deleteManyNotRemoved is missing, should be there!');
    }
  });

  it('should update document with id', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create(new User({fullName: 'updateOneWithId'}));
    await userRepository.update(user._id, {age: 29});
    const foundUser = await userRepository.findOneBy({fullName: 'updateOneWithId'});
    if (!foundUser) {
      throw new Error('updateOneBy is missing, should be there!');
    }

    expect(foundUser.age).eq(29);
  });

  it('should update document with document', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create(new User({fullName: 'updateOneWithDocument'}));
    await userRepository.update(user._id, {age: 29});
    const foundUser = await userRepository.findOneBy({fullName: 'updateOneWithDocument'});
    if (!foundUser) {
      throw new Error('updateOneBy is missing, should be there!');
    }

    expect(foundUser.age).eq(29);
  });

  it('should update document with string id', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create(new User({fullName: 'updateOneWithStringId'}));
    await userRepository.update(user._id.toHexString(), {age: 29});
    const foundUser = await userRepository.findOneBy({fullName: 'updateOneWithStringId'});
    if (!foundUser) {
      throw new Error('updateOneBy is missing, should be there!');
    }

    expect(foundUser.age).eq(29);
  });

  it('should update document by updateOneBy', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    await userRepository.create(new User({fullName: 'updateOneBy'}));
    await userRepository.updateOneBy({fullName: 'updateOneBy'}, {age: 29});
    const foundUser = await userRepository.findOneBy({fullName: 'updateOneBy'});
    if (!foundUser) {
      throw new Error('updateOneBy is missing, should be there!');
    }

    expect(foundUser.age).eq(29);
  });

  it('should update many document', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    await userRepository.create(new User({fullName: 'updateManyNative'}));
    await userRepository.create(new User({fullName: 'updateManyNative'}));
    await userRepository.updateManyNative({fullName: 'updateManyNative'}, {age: 29});
    const foundUsers = await userRepository.findBy({fullName: 'updateManyNative'});
    if (!foundUsers) {
      throw new Error('updateManyNative is missing, should be there!');
    }

    expect(foundUsers[0].age).eq(29);
  });

});
