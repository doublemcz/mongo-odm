import { BaseDocument, Collection, Property } from '../../lib';
import { ObjectID } from 'bson';
import { CustomRepository } from '../repositories/CustomRepository';

@Collection({customRepository: CustomRepository})
export class UserSomethingTest extends BaseDocument {

  @Property()
  public _id: ObjectID;

  @Property()
  public test: string;

}
