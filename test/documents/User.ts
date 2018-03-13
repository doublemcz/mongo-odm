import { BaseDocument } from '../../src/BaseDocument';
import { Document } from '../../src/Decorators/Document';

@Document({collectionName: 'test'})
export class User extends BaseDocument {

  private privateProperty: "hidden";
  public someUserMember = "Hey!";

}
