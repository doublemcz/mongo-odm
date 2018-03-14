import { BaseDocument } from '../../src/BaseDocument';
import { Document } from '../../src/Decorators/Document';
import { Property } from '../../src/Decorators/Property';

@Document({collectionName: 'log'})
export class Log extends BaseDocument {

  @Property()
  eventType: number;

  // @ManyToOne()
  // user: User;

}
