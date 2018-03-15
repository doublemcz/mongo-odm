import { expect } from 'chai';
import 'mocha';
import { DocumentManager } from '../src/DocumentManager';
import { dbPromise } from './core/connection';
import { Log } from './documents/Log';
// import { config } from './config/default';

describe('Document manager', () => {

  // Need to rework document manager (from db to connection)
  // it('check document manager creation', async () => {
  //   const documentManager = await DocumentManager.create((config.odm as any));
  //   expect(documentManager).to.be.instanceOf(DocumentManager);
  // });

  it('check documents registration', async () => {
    const documentsDir = process.cwd() + '/test/documents';
    const documentManager = new DocumentManager(dbPromise, {documentsDir: documentsDir});
    const documents = documentManager.getRegisteredDocuments();
    expect(Object.keys(documents).length).to.be.greaterThan(0);
  });

  it('check repository creation', async () => {
    const documentsDir = process.cwd() + '/test/documents';
    const documentManager = new DocumentManager(dbPromise, {documentsDir: documentsDir});
    const logRepository = documentManager.getRepository<Log>(Log);
    expect(logRepository.getCollectionName()).to.string('log');
  });

});
