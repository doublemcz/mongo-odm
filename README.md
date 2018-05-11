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
@Collection()
export class User extends BaseDocument {

  @Property()
  public _id: ObjectID;

  @Property()
  public fullName: string;

  // When you specify `referencedField` then it means you don't own the join property
  @OneToMany({targetDocument: 'Log', referencedField: 'user'})
  public log: Log[];

  @OneToOne({targetDocument: 'Car', referencedField: 'user'})
  public car: Car;
  
  // If you don't specify `referencedField` it means you own the the reference IDs - you have array of address ids in your collection
  @OneToMany({targetDocument: 'Address'})
  public addresses: Address;

}
```

You can set different collection name by `collectionName` property in decorator

```
@Collection({collectionName: 'a-name'})

```

Script auto generates lisp-case (kebab-case) for any name automatically
```
class UserAddress extends ... => collection name 'user-address'
```


## CRUD

First of all you need to create instance of Document Manager

```
// database.ts
// Default is localhost
const documentManager = DocumentManager.create({
   database: 'mongo-odm',
   documentsDir: './dist/documents' // Documents dir must point dist one
});

// You can also specify own url in options for replica set and another parameters (like http auth.)
{
  url: 'mongodb://node1,node2:27889,node3/?replicaSet=rs0'
}
```

It is recommended to create all repositories and export them from the database.ts as follows:

```
export const userRepository = documentManager.getRepository<User>(User);
export const logRepository = documentManager.getRepository<Log>(Log);
export const ... = documentManager.getRepository<...>(...);
```

You don't need to get instance of repository from document manager again and just import it where it is needed.

### Create
```
const user = await userRepository.create(new User({fullName: "Pepa Voprsalek"));
```

```
const user2 = new User();
user2.fullName = "another user";
await userRepository.create(user2);

// You can also send there plain object, after create you will get proper object based by repository
const userInstance = await userRepository.create({fullName: 'another fullname'});
console.log(userInstance._id);
```

After `create` you will get assigned `_id` to you object from query result

### Retrieve

All find methods return complete model with all private fields and model methods

```
const user1 = await userRepository.findOneBy({fullName: 'Foo bar'});
const user2 = await userRepository.findOneById('2312ba029fec9223...');
const users = await userRepository.findBy({'fullName': '....'});
```


#### Populate

```
const user = await userRepository.findOneBy({...}, ['log']);
// If log is @OneToMany you can access as usual -> user.log[0].eventType
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
userRepository.updateOneBy({fullName: 'old fullname'}, { fullName: 'new fullName'});
```


### Delete
```
// By string id
userRepository.delete('52acfac010e110a0..');

// By ObjectId
const userId = new ObjectID('52acfac010e110a0..'):
userRepository.delete(userId);

// By model
const user = await userRepository.find({...});
userRepository.delete(user);
```

Also you can delete a document by where:
```
userRepository.deleteOneBy({fullName: 'some filter value'});
```

### Count
```
const usersCount = await userRepository.count();

// With where
const youngUserCount = await userRepository.count({age: 29');
```

### Sum
```
const totalAgeOfAllUsers = await userRepository.sum('age');

// With where
const sum = await userRepository.sum('age', {age: { $gt: 30}}');
```

### Aggregate
```
const cursor = await aggregationRepository.aggregate([{
  $group: {_id: null, sum: {$sum: '$someNumber'}}
}]);

cursor.next((err: any, row: any) => {
  if (err) {
    throw err;
  }

  // row.sum === 20
});
```

## Custom repository
You can specify your own class for a type
```
## Repository class
import { BaseDocument, Repository } from '../../lib';
import { FindOneOptions } from 'mongodb';

export class UserRepository<T extends BaseDocument> extends Repository<T> {

  public async findOneBy(where: any = {}, populate: string[] = [], options: FindOneOptions = {}): Promise<T | null> {
    const user = (await super.findOneBy(where, populate, options) as any);
    if (user) {
      // i.e. LOG WE FOUND THE USER
    }

    return something;
  }

}

## Model
@Collection({customRepository: UserRepository})
export class User {
  ...
}

```

### Hooks
We support all pre/post create/update/delete hooks. They need decorator as follows:

 - @PreCreate
 - @PostCreate
 - @PreUpdate
 - @PostUpdate
 - @PreDelete
 - @PostDelete

```
class User extends BaseDocument {

  @PreCreate()
  preCreate() {
    this.createdAt = new Date();
  }
  
  @PostCreate()
  postCreate() {
    elasticSearch.put(....);
  }
  
  @PreUpdate()
  preUpdate() {
    this.updatedAt = new Date();
  }
  
  
  @PostUpdate()
  postUpdate() {
     logger.log('Updated ID:' + this._id);
  }
  
  @PostDelete()
  postDelete() {
    imageRepository.removeFromFileSystem(this)
  }
  
}

```

You can have as many hooks as you need as

```

@PostCreate()
logAfterCreate() {
  // logging stuff
}

@PostCreate() 
doAnotherThings() {
  // another amazing stuff
}

```


## Future
- validations
- field name translation (custom db fields)
- possibility to specify where in @OneToOne or @OneToMany
- lazy loading on @OneToOne and @OneToMany...?
