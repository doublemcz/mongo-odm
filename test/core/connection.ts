import { config } from '../config/default';
import { DocumentManager } from '../../lib/DocumentManager';

export const documentManager = DocumentManager.create(config.odm);
