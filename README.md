[![Build Status](https://travis-ci.org/doublemcz/mongo-odm.svg?branch=master)](https://travis-ci.org/doublemcz/mongo-odm)
[![Coverage Status](https://coveralls.io/repos/github/doublemcz/mongo-odm/badge.svg?branch=master)](https://coveralls.io/github/doublemcz/mongo-odm?branch=master)

# Mongo ODM


A typescript ODM based on native node.js Mongo library.

## Installation 
```
npm install --save mong-odm

// or

yarn add mongo-odm

```


## Model

```
@Document()
export class User extends BaseDocument {

  @Property()
  public _id: ObjectID;

  @Property()
  public fullName: string;

  // WHen you specify `referenceField` then it means you don't own the join property
  @OneToMany({targetDocument: 'Log', referencedField: 'user'})
  public log: Log[];

  @OneToOne({targetDocument: 'Car', referencedField: 'user'})
  public car: Car;
  
  // If you don't specify `referenceField` it means you own the the reference IDs - you have array of address ids in your collection
  @OneToMany({targetDocument: 'Address'})
  public addresses: Address;

}
```


## CRUD

First of all you need to create instance of Document Manager

```
// Default is localhost
const documentManager = await DocumentManager.create({
   database: 'mongo-odm',
   documentsDir: './dist/documents' // Documents dir must point dist one
});

// You can also specify own url in options for replica set and another parameters (like http auth.)
{
  url: 'mongodb://node1,node2:27889,node3/?replicaSet=rs0'
}
```

### Create
```
const userRepository = documentManager.getRepository<User>(User);
const user = await.userRepository.create(new User({fullName: "Pepa Voprsalek"));
```
`user` has been initialized as model (so it has all props / methods

You can also put there your already created model and repository just fills the `_id`
```
const user2 = new User();
user2.fullName = "another user";
await userRepository.create(user2);
```

### Retrieve

All find methods return complete model with all private fields and model methods

```
const userRepository = documentManager.getRepository<User>(User);
const user = await userRepository.findOneBy({fullName: 'Foo bar'});
```

```
const user = await userRepository.findOneById('2312ba029fec9223...');
```

```
const users = await userRepository.findBy({'fullName': '....'});
```


#### Populate

```
const userRepository = documentManager.getRepository<User>(User);
const user = await userRepository.findOneBy({...}, ['log']);
// user.log[0].eventType
```

### Update
```
// By string id
userRepository.update('52acfac010e110a0..', { fullName: "new fullName"});
// By ObjectId
userRepository.update(ObjectId(...), { fullName: "new fullName"});

// By model
const user = await userRepository.find(...);
userRepository.update(user, { fullName: "new fullName"});
```

Also you can update a document by where:
```
// By ObjectId
userRepository.updateOneBy({fullName: 'some filter value', { fullName: "new fullName"});
```


### Delete
```
// By string id
userRepository.delete('52acfac010e110a0..');
// By ObjectId
userRepository.delete(ObjectId(...));

// By model
const user = await userRepository.find(...);
userRepository.delete(user);
```

Also you can delete a document by where:
```
// By ObjectId
userRepository.deleteOneBy({fullName: 'some filter value'});
```

### Count
```
const usersCount = await userRepository.count();
const youngUserCount = await userRepository.count({age: 29');
```

### Hooks
We support preCreate and postCreate hooks. They don't need any decorator due to 'hardcoded' name for simplicity. 
If there is such name, repository will call this method.

```
class User extends BaseDocument {

  preCreate(repository: Repository) {
    this.createdAt = new Date();
  }
  
  postCreate(repository: Repository) {
    elasticSearch.put(....);
  }
}

```


## Missing
- custom repositories
- delete and update hooks (pre, post)
- validations
- field name translation (custom db fields)
- possibility to specify where in @OneToOne or @OneToMany
- lazy loading on @OneToOne and @OneToMany
