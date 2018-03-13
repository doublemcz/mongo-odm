import { expect } from 'chai';
import 'mocha';
import { MongoClient } from 'mongodb';
import { config } from './config/default';

describe('Client', () => {

  it('should connect to server', async () => {
    const db = await MongoClient.connect(config.odm.url);
    expect(db.isConnected(config.odm.database)).to.equal(true);
    db.close();
  });

});
