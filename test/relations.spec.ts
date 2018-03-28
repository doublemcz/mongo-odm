import { expect } from 'chai';
import 'mocha';
import { documentManager } from './core/connection';
import { User } from './documents/User';
import { Log } from './documents/Log';
import { Car } from './documents/Car';
import { isArray } from 'util';
import { Address } from './documents/Address';
import { ObjectID } from 'bson';

describe('Relations', () => {

  it('should check oneToOne with reference field', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create(new User({fullName: 'Lukas Ruczkowski'}));
    await documentManager
      .getRepository<Car>(Car)
      .create(new Car({brand: 'Skoda', user: user._id}));

    const foundUser = await userRepository.find(user._id, ['car']);
    if (foundUser && foundUser.car) {
      expect(foundUser.car.brand).eq('Skoda');
    } else {
      throw new Error('find didn\'t returned car at all');
    }
  });

  it('should check oneToMany with reference field', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = new User({fullName: 'Filip Stopka'});
    await userRepository.create(user);
    await documentManager
      .getRepository<Log>(Log)
      .create(new Log({eventType: 1, user: user._id}));

    const foundUser = await userRepository.find(user._id, ['log']);
    if (!foundUser) {
      throw new Error('find didn\'t returned user');
    }

    if (isArray(foundUser.log) && foundUser.log.length) {
      expect(foundUser.log[0].eventType).eq(1);
    } else {
      throw new Error('@OneToMany returned empty array');
    }
  });

  it('should check oneToMany without reference field', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const logRepository = documentManager.getRepository<Address>(Address);

    const user = await userRepository.create(new User({fullName: 'Zla Chripka'}));
    const city1 = await logRepository.create(new Address({street: 'a street', city: 'Prague'}));
    const city2 = await logRepository.create(new Address({street: 'a street', city: 'Brno'}));

    (user.addresses as Address[]).push(city1, city2);
    await userRepository.update(user, {addresses: user.addresses});

    // Find the user without population and check id
    let foundUser = await userRepository.find(user._id);
    if (!foundUser) {
      throw new Error('find didn\'t returned user');
    }

    expect(foundUser.addresses).to.be.instanceOf(Array);
    expect(foundUser.addresses.length).to.be.greaterThan(0, 'Address array is not initialized with @OneToMany');
    expect(foundUser.addresses[0]).to.be.instanceOf(ObjectID);

    // Find the user and populate
    foundUser = await userRepository.find(user._id, ['addresses']);
    if (!foundUser) {
      throw new Error('find didn\'t returned user');
    }

    expect(foundUser.addresses[0]).to.be.instanceOf(Address);
  });

  it('should check populate oneToOne from findBy one by reference field', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const carsRepository = documentManager.getRepository<Car>(Car);
    const user = await userRepository.create(new User({fullName: 'findByPopulateOneToOneReferenceField'}));
    await carsRepository.create(new Car({brand: 'Bugatka', user: user._id}));
    const foundUsers = await userRepository.findBy({fullName: 'findByPopulateOneToOneReferenceField'}, ['car']);
    expect(foundUsers.length).to.be.eq(1);
    expect(foundUsers[0].car.brand).to.string('Bugatka');
  });

  it('should check populate oneToMany from findBy one by reference field', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const logRepository = documentManager.getRepository<Log>(Log);
    const user = await userRepository.create(new User({fullName: 'findByPopulateOneToManyReferenceField'}));
    await logRepository.create(new Log({eventType: 1, user: user._id }));
    const foundUsers = await userRepository.findBy({fullName: 'findByPopulateOneToManyReferenceField'}, ['log']);
    expect(foundUsers.length).to.be.eq(1);
    expect(foundUsers[0].log.length).to.be.eq(1);
    expect(foundUsers[0].log[0].eventType).to.be.eq(1);
  });

});
