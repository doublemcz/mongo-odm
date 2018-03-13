import { BaseDocument } from '../../src/BaseDocument';
import { Document } from '../../src/Decorators/Document';
import { Property } from '../../src/Decorators/Property';

@Document({collectionName: 'test'})
export class User extends BaseDocument {

  @Property()
  public fullName: string;

  private privateProperty = "hidden";
  public someUserMember = "Hey!";

}
