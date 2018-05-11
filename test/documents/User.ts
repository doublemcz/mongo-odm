import { BaseDocument, Collection, OneToMany, OneToOne, Property } from '../../lib';
import { Log } from './Log';
import { ObjectID } from 'bson';
import { Car } from './Car';
import { Address } from './Address';

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
