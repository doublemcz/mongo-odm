import { BaseDocument, Collection, OneToMany, OneToOne, Property } from '../../lib';
import { Log } from './Log';
import { ObjectID } from 'bson';
import { Car } from './Car';
import { Address } from './Address';
import { PostCreate, PostUpdate, PreCreate, PreUpdate } from '../../lib';

@Collection()
export class User extends BaseDocument {

  @Property()
  public _id: ObjectID;

  @Property()
  public fullName: string;

  @Property()
  public age: number;

  @OneToOne({targetDocument: 'Car', referencedField: 'user'})
  public car: Car;

  @OneToMany({targetDocument: 'Log', referencedField: 'user'})
  public log: Log[];

  @OneToOne({targetDocument: 'Address'})
  public address: Address | ObjectID;

  @OneToMany({targetDocument: 'Address'})
  public addresses: Address[] | string[];

  @Property()
  public createdAt: Date;

  @Property()
  public someDate: Date;

  @Property()
  public asyncFullNameTest: string;

  @Property()
  public asyncUpdateFullNameTest: string;

  @Property({isPrivate: true})
  public password: string;

  @PreCreate()
  public async preCreate() {
    this.createdAt = new Date();
    this.asyncFullNameTest = await this.asyncFullNameTestFn();
  }

  private async asyncFullNameTestFn() {
    return 'preCreateAsyncHook Works!'
  }

  @PostCreate()
  public postCreate() {
    if (this.fullName === 'postCreate') {
      this.fullName = 'postCreate Works!';
    }
  }

  @PreUpdate()
  public preUpdate() {
    if (this.fullName === 'preUpdateHookTest') {
      this.fullName = 'preUpdateHookTest Works!';
    }
  }

  @PreUpdate()
  public async preUpdate2() {
    this.asyncUpdateFullNameTest = await this.asyncFullNameTestFn2();
  }

  private async asyncFullNameTestFn2() {
    return 'preUpdateAsyncHook Works!'
  }

  @PostUpdate()
  public postUpdate() {
    if (this.fullName === 'postUpdateHookTest2') {
      this.fullName = 'postUpdateHookTest Works!';
    }
  }

  private privateProperty = 'hidden';
  public someUserMember = 'Hey!';

  public testMethod() {
    return this.fullName;
  }

}
