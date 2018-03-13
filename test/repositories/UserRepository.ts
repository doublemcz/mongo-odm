import { Repository } from '../../src/Repository';
import { User } from '../documents/User';
import { dbPromise } from '../core/connection';

export const userRepository = new Repository<User>(User, dbPromise);
