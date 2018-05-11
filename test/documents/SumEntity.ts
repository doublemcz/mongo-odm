import { BaseDocument, Collection, Property } from '../../lib';
import { ObjectID } from 'bson';

@Collection()
export class SumEntity extends BaseDocument {

  @Property()
  public _id: ObjectID;

  @Property()
  public someNumber: number;

  @Property()
  public filter: string;

}
