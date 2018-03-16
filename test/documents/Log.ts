import { BaseDocument, Property, Collection } from '../../lib';
import { ObjectID } from 'bson';
import { User } from './User';

@Collection({collectionName: 'log'})
export class Log extends BaseDocument {

  @Property()
  public _id: ObjectID;

  @Property()
  eventType: number;

  @Property()
  user: User | string;

}
