import { expect } from 'chai';
import 'mocha';
import { User } from './documents/User';
import { ArticleCover } from './documents/ArticleCover';
import { documentManager } from './core/connection';
import { UserSomethingTest } from './documents/UserSomethingTest';

describe('Model', () => {

  it('document properties length should be bigger then 0', async () => {
    const user = new User();
    const properties = user.getOdmProperties();
    expect(Object.keys(properties).length).greaterThan(0);
  });

  it('should not contain private fields in toObject', async () => {
    const user = new User();
    expect(Object.keys(user.toObject())).not.contains('privateProperty');
  });

  it('should check custom collection name', async () => {
    const articleCoverRepository = documentManager.getRepository<ArticleCover>(ArticleCover);
    expect(articleCoverRepository.getCollectionName()).eq('article-cover');
  });

  it('should check automatic translating collection name', async () => {
    const articleCoverRepository = documentManager.getRepository<UserSomethingTest>(UserSomethingTest);
    expect(articleCoverRepository.getCollectionName()).eq('user-something-test');
    await articleCoverRepository.create({test: 'test'});
  });

});
