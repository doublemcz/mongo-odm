import { BaseDocument, Property, Collection, OneToOne } from '../../lib';
import { ObjectID } from 'bson';
import { User } from './User';

@Collection()
export class Car extends BaseDocument {

  @Property()
  public _id: ObjectID;

  @Property()
  public brand: string;

  @OneToOne({targetDocument: 'User'})
  public user: User | string;

}
