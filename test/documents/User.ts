import { BaseDocument } from '../../src/BaseDocument';
import { Document } from '../../src/Decorators/Document';
import { Property } from '../../src/Decorators/Property';
import { OneToMany } from '../../src/Decorators/OneToMany';
import { OneToOne } from '../../src/Decorators/OneToOne';
import { Log } from './Log';
import { ObjectID } from 'bson';
import { Car } from './Car';

@Document()
export class User extends BaseDocument {

  @Property()
  public _id: ObjectID;

  @Property()
  public fullName: string;

  @Property({test: 1})
  public age: number;

  @OneToMany({type: Log, referencedField: 'user'})
  public log: Log[];

  @OneToOne({type: Car, referencedField: 'user'})
  public car: Car;

  private privateProperty = "hidden";
  public someUserMember = "Hey!";

}
