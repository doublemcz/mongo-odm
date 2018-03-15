import { documentManager } from './core/connection';

before(async() => {
  return (await documentManager.getDb()).dropDatabase();
});

after(async () => {
  const mongoClient = await documentManager.getMongoClient();
  await mongoClient.close();
});
