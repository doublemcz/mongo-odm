import { config } from '../config/default';
import { DocumentManager } from '../../src/DocumentManager';

export const documentManager = DocumentManager.create(config.odm);
