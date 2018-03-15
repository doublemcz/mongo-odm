[![Build Status](https://travis-ci.org/doublemcz/mongo-odm.svg?branch=master)](https://travis-ci.org/doublemcz/mongo-odm)
[![Coverage Status](https://coveralls.io/repos/github/doublemcz/mongo-odm/badge.svg?branch=master)](https://coveralls.io/github/doublemcz/mongo-odm?branch=master)

# WIP: Mongo ODM


A typescript ODM based on native node.js Mongo library.


### CRUD

#### Create
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



#### Missing for first beta release
- custom repositories
- field name translation (custom db fields)

#### Future
- possibility to specify where in @OneToOne or @OneToMany
- lazy loading on @OneToOne and @OneToMany
