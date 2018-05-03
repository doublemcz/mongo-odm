import { BaseDocument, Collection, Property } from '../../lib';
import { ObjectID } from 'bson';

@Collection({collectionName: 'article-cover'})
export class ArticleCover extends BaseDocument {

  @Property()
  public _id: ObjectID;

}
