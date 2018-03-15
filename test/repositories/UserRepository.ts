import { Repository } from '../../src/Repository';
import { User } from '../documents/User';
import { documentManager } from '../core/connection';

export const userRepository = new Repository<User>(User, documentManager);
