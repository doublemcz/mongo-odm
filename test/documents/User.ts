import { BaseDocument, Collection, OneToMany, OneToOne, Property } from '../../lib';
import { Log } from './Log';
import { ObjectID } from 'bson';
import { Car } from './Car';

@Collection()
export class User extends BaseDocument {

  @Property()
  public _id: ObjectID;

  @Property()
  public fullName: string;

  @Property({test: 1})
  public age: number;

  @OneToMany({type: Log, referencedField: 'user'})
  public log: Log[];

  @OneToOne({type: Car, referencedField: 'user'})
  public car: Car;

  @Property()
  public createdAt: Date;

  private privateProperty = 'hidden';
  public someUserMember = 'Hey!';

  public preCreate() {
    this.createdAt = new Date();
  }

  public testMethod() {
    return this.fullName;
  }

  public postCreate() {
    if (this.fullName === 'postCreate') {
      this.fullName = 'postCreate Works!';
    }
  }

}
