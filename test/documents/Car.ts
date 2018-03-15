import { BaseDocument } from '../../src/BaseDocument';
import { Document } from '../../src/Decorators/Document';
import { Property } from '../../src/Decorators/Property';
import { ObjectID } from 'bson';
import { User } from './User';

@Document()
export class Car extends BaseDocument {

  @Property()
  public _id: ObjectID;

  @Property()
  public brand: string;

  @Property()
  public user: User | string;

}
