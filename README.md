[![Build Status](https://travis-ci.org/doublemcz/mongo-odm.svg?branch=master)](https://travis-ci.org/doublemcz/mongo-odm)
[![Coverage Status](https://coveralls.io/repos/github/doublemcz/mongo-odm/badge.svg?branch=master)](https://coveralls.io/github/doublemcz/mongo-odm?branch=master)

# WIP: Mongo ODM


A typescript ODM based on native node.js Mongo library.


## Model

```
@Document()
export class User extends BaseDocument {

  @Property()
  public _id: ObjectID;

  @Property()
  public fullName: string;

  @OneToMany({type: Log, referencedField: 'user'})
  public log: Log[];

  @OneToOne({type: Car, referencedField: 'user'})
  public car: Car;

}
```


## CRUD

First of all you need to create instance of Document Manager

```
const documentManager = await DocumentManager.create({
   url: 'mongodb://localhost:27017/mongo-odm',
   database: 'mongo-odm',
   documentsDir: '/var/www/app/src/documents'
});
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

All find methods returns complete model with all private fields and model methods

```
const userRepository = documentManager.getRepository<User>(User);
const user = await userRepository.findOneBy({fullName: 'Foo bar'});
```

```
const userRepository = documentManager.getRepository<User>(User);
const user = await userRepository.findOneById('2312ba029fec9223...');
```

```
const userRepository = documentManager.getRepository<User>(User);
const users = await userRepository.findBy({'fullName': '....'});
```

#### Populate

```
const userRepository = documentManager.getRepository<User>(User);
const user = await userRepository.findOneBy({...}, ['log']);
// user.log[0].eventType
```


## Missing
- custom repositories
- hooks (pre, post)
- validations
- field name translation (custom db fields)
- possibility to specify where in @OneToOne or @OneToMany
- lazy loading on @OneToOne and @OneToMany
