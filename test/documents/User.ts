import { BaseDocument } from '../../src/BaseDocument';
import { Document } from '../../src/Decorators/Document';
import { Property } from '../../src/Decorators/Property';
import { OneToMany } from '../../src/Decorators/OneToMany';
import { Log } from './Log';
import { ObjectID } from 'bson';

@Document()
export class User extends BaseDocument {

  @Property({field: '_id'})
  public id: ObjectID;

  @Property()
  public fullName: string;

  @Property({test: 1})
  public age: number;

  @OneToMany({referencedField: 'user', type: Log})
  public log: Log[];

  private privateProperty = "hidden";
  public someUserMember = "Hey!";

}
