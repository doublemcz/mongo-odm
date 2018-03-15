import { expect } from 'chai';
import 'mocha';
import { DocumentManager } from '../src/DocumentManager';
import { Log } from './documents/Log';
import { config } from './config/default';

describe('Document manager', () => {

  it('check document manager creation', async () => {
    const documentManager = await DocumentManager.create((config.odm as any));
    expect(documentManager).to.be.instanceOf(DocumentManager);
    await (await documentManager.getMongoClient()).close();
  });

  it('check document manager can connect to db', async () => {
    const documentManager = await DocumentManager.create((config.odm as any));
    expect(await documentManager.isConnected()).to.equal(true);
    await (await documentManager.getMongoClient()).close();
  });

  it('check documents registration', async () => {
    const documentManager = await DocumentManager.create((config.odm as any));
    const documents = documentManager.getRegisteredDocuments();
    expect(Object.keys(documents).length).to.be.greaterThan(0);
    await (await documentManager.getMongoClient()).close();
  });

  it('check repository creation', async () => {
    const documentManager = await DocumentManager.create((config.odm as any));
    const logRepository = documentManager.getRepository<Log>(Log);
    expect(logRepository.getCollectionName()).to.string('log');
    await (await documentManager.getMongoClient()).close();
  });

});
