import { config } from '../config/default';
import { DocumentManager } from '../../lib';

export const documentManager = DocumentManager.create(config.odm);
