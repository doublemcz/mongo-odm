import { BaseDocument, Collection, Property } from '../../lib';
import { ObjectID } from 'bson';

@Collection()
export class UserSomethingTest extends BaseDocument {

  @Property()
  public _id: ObjectID;

  @Property()
  public test: string;

}
