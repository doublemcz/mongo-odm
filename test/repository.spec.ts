import 'mocha';
import { expect } from 'chai';

import { User } from './documents/User';
import { documentManager } from './core/connection';
import { UserSomethingTest } from './documents/UserSomethingTest';
import { SumEntity } from './documents/SumEntity';
import { AggregationTest } from './documents/AggregationTest';

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
    expect(user._id.toHexString()).be.a('string');
  });

  it('should throw exception on non-registered document', async () => {
    expect(documentManager.getRepository.bind(<any>(function test() {
    }))).to.throw();
  });

  it('should check if property can be populated', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    expect(userRepository.canPopulate('test')).to.be.equal(false);
    expect(userRepository.canPopulate('car')).to.be.equal(true);
  });

  it('should create document without entity', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create({fullName: 'plain object'});
    expect(user).to.be.instanceOf(User);
    expect(user).to.be.property('fullName', 'plain object');
    expect(user._id.toHexString()).be.a('string');
  });

  it('should find user by string id', async() => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create({fullName: 'userByStringId'});
    expect(user).to.be.instanceOf(User);
    const user2 = await userRepository.find(user._id.toHexString());
    expect(user2._id.toHexString()).to.be.equal(user._id.toHexString());
  });

  it('should find user by object id', async() => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create({fullName: 'userByObjectId'});
    expect(user).to.be.instanceOf(User);
    const user2 = await userRepository.find(user._id);
    expect(user2._id.toHexString()).to.be.equal(user._id.toHexString());
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

  it('should check correct document type creation from findBy', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    await userRepository.create(new User({fullName: 'findOneCorrectDocument'}));
    const foundUsers = await userRepository.findBy({fullName: 'findOneCorrectDocument'});
    expect(foundUsers.length).to.be.gt(0);
    expect(foundUsers[0].testMethod).to.be.a('function');
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

  it('should update document with document instance', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create(new User({fullName: 'updateOneWithDocument'}));
    await userRepository.update(user, {age: 29});
    const foundUser = await userRepository.findOneBy({fullName: 'updateOneWithDocument'});
    if (!foundUser) {
      throw new Error('updateOneBy is missing, should be there!');
    }

    expect(foundUser.age).eq(29);
  });

  it('should update document with document instance', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    let user = await userRepository.create(new User({fullName: 'updateOneWithDocumentInstanceExpectInstance'}));
    user = await userRepository.update(user, {age: 18});
    if (user) {
      expect(user.age).eq(18);
    }
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

  it('should count people in repo', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const foundUsersCount = await userRepository.count({age: 29});
    expect(foundUsersCount).greaterThan(0);
  });

  it('should test result from find in custom repository', async () => {
    const customRepository = documentManager.getRepository<UserSomethingTest>(UserSomethingTest);
    await customRepository.create({test: 'test2'});
    const result = await customRepository.findOneBy({test: 'test2'});
    if (!result) {
      throw new Error('The value should be in the database');
    }

    expect(result.test).eq('CHANGED!');
  });

  it('should test sum', async () => {
    const sumRepository = documentManager.getRepository<SumEntity>(SumEntity);
    await sumRepository.create({someNumber: 1});
    await sumRepository.create({someNumber: 1});
    await sumRepository.create({someNumber: 2, filter: 'test'});
    const sum = await sumRepository.sum('someNumber');

    expect(sum).to.be.equal(4);

    const sumWithFilter = await sumRepository.sum('someNumber', {filter: 'test'});

    expect(sumWithFilter).to.be.equal(2);
  });

  it('should run basic aggregation', async () => {
    const aggregationRepository = documentManager.getRepository<AggregationTest>(AggregationTest);
    await aggregationRepository.create({someNumber: 10});
    await aggregationRepository.create({someNumber: 10});
    const cursor = await aggregationRepository.aggregate([{
      $group: {_id: null, sum: {$sum: '$someNumber'}}
    }]);

    cursor.next((err: any, row: any) => {
      if (err) {
        throw err;
      }

      expect(row.sum).to.be.equal(20);
    });
  });

  it('should be return result from db when an object is in where instead of id', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create(new User({fullName: 'findByObjectInsteadOfId'}));
    const theSameUser = await userRepository.findOneBy({_id: user});
    if (!theSameUser) {
      throw new Error('findOneBy result is wrong, a record should be there!');
    }

    expect(theSameUser._id.toHexString()).eq(user._id.toHexString());
  });

  it('should update record without specifying altering object', async() => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create(new User({fullName: 'withoutAlteringObject'}));
    user.fullName = 'withoutAlteringObject2';
    await userRepository.update(user);
    const userToCheck = await userRepository.find(user._id);
    if (!userToCheck) {
      throw new Error('find result is wrong, a record should be there!');
    }

    expect(userToCheck.fullName).eq('withoutAlteringObject2');
  });

});
