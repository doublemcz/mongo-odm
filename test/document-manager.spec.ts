import { expect } from 'chai';
import 'mocha';
import { DocumentManager } from '../src/DocumentManager';
import { dbPromise } from './core/connection';
import { Log } from './documents/Log';

describe('Document manager', () => {

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
