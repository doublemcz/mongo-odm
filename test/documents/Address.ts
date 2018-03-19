import { BaseDocument, Collection, OneToOne, Property } from '../../lib';
import { User } from './User';
import { ObjectID } from 'bson';

@Collection()
export class Address extends BaseDocument {

  @Property()
  street1: string;

  @Property()
  street2: string;

  @Property()
  city: string;

  @Property()
  zipCode: string;

  @OneToOne({targetDocument: User})
  user: User | ObjectID;

}