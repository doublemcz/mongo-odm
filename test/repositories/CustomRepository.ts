import { BaseDocument, Repository } from '../../lib';
import { FindOneOptions } from 'mongodb';

export class CustomRepository<T extends BaseDocument> extends Repository<T> {

  public async findOneBy(where: any = {}, populate: string[] = [], options: FindOneOptions = {}): Promise<T | null> {
    const something = (await super.findOneBy(where, populate, options) as any);
    if (something) {
      something.test = 'CHANGED!';
    }

    return something;
  }

}
