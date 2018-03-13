import { mongoClientPromise } from './core/connection';
import { config } from './config/default';

before(async() => {
  const mongoClient = await mongoClientPromise;
  return mongoClient.db(config.odm.database).dropDatabase();
});

after(async () => {
  const mongoClient = await mongoClientPromise;
  mongoClient.close();
});
