import 'mocha';
import { User } from './documents/User';
import { documentManager } from './core/connection';
import { expect } from 'chai';

describe('Hooks', () => {

  it('checks preCreate hook', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = await userRepository.create(new User({fullName: 'Toma'}));
    expect(user.createdAt).to.instanceOf(Date);
    expect(user._id.toHexString()).be.a('string');
  });

  it('checks postCreate hook', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    const user = new User({fullName: 'postCreate'});
    await userRepository.create(user);
    expect(user.fullName).be.equal('postCreate Works!');
  });

  it('checks preUpdate hook', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    let user = await userRepository.create(new User({fullName: 'preUpdateHookTest'}));
    user = (await userRepository.update(user, {age: 1}) as User);
    expect(user.fullName).to.be.equal('preUpdateHookTest Works!');
  });

  it('checks postUpdate hook', async () => {
    const userRepository = documentManager.getRepository<User>(User);
    let user = await userRepository.create(new User({fullName: 'postUpdateHookTest'}));
    user = (await userRepository.update(user, {fullName: 'postUpdateHookTest2'}) as User);
    expect(user.fullName).to.be.equal('postUpdateHookTest Works!');
  });

});
