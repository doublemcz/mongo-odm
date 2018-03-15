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
// Default is localhost
const documentManager = await DocumentManager.create({
   database: 'mongo-odm',
   documentsDir: './src/documents'
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

### Hooks
We support preCreate and postCreate hooks. They don't need any decorator.

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
