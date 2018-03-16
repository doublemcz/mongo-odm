import { BaseDocument, Property, Collection } from '../../lib';
import { ObjectID } from 'bson';
import { User } from './User';

@Collection()
export class Car extends BaseDocument {

  @Property()
  public _id: ObjectID;

  @Property()
  public brand: string;

  @Property()
  public user: User | string;

}
