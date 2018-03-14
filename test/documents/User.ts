import { BaseDocument } from '../../src/BaseDocument';
import { Document } from '../../src/Decorators/Document';
import { Property } from '../../src/Decorators/Property';
import { OneToMany } from '../../src/Decorators/OneToMany';
import { Log } from './Log';

@Document({collectionName: 'test'})
export class User extends BaseDocument {

  @Property()
  public fullName: string;

  @Property({test: 1})
  public age: number;

  @OneToMany({referencedField: 'user'})
  public log: Log[];

  private privateProperty = "hidden";
  public someUserMember = "Hey!";

}
