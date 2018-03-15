import { Db, MongoClient } from 'mongodb';
import { config } from '../config/default';
import { DocumentManager } from '../../src/DocumentManager';

export const mongoClientPromise = MongoClient.connect(config.odm.url);

export const dbPromise: Promise<Db> = mongoClientPromise
  .then((mongoClient: MongoClient): Db => {
    return mongoClient.db(config.odm.database);
  });

export const documentManager = new DocumentManager(dbPromise, {});
