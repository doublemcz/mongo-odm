import { BaseDocument, Collection, OneToOne, Property } from '../../lib';
import { User } from './User';
import { ObjectID } from 'bson';

@Collection()
export class Address extends BaseDocument {

  @Property()
  public _id: ObjectID;

  @Property()
  public street1: string;

  @Property()
  public street2: string;

  @Property()
  public city: string;

  @Property()
  public zipCode: string;

  @OneToOne({targetDocument: 'User'})
  public user: User | ObjectID;

}
