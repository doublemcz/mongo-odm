import { Db } from 'mongodb';
import { BaseDocument } from './BaseDocument';
import * as fs from 'fs';
import { Repository } from './Repository';

export class DocumentManager {

  /** @type {object} Object with Documents extended from BaseDocument */
  protected documents: any = {};
  /** @type {object} Object with Repositories */
  private repositories: any = {};

  /**
   * @param {Promise<Db>} db
   * @param {DocumentManagerOptions} options
   */
  public constructor(protected db: Promise<Db>, private options: DocumentManagerOptions) {
    this.registerDocuments();
  }

  /**
   * @returns {Promise<Db>}
   */
  public getDb(): Promise<Db> {
    return this.db;
  }

  /**
   * @param {string} name
   * @param {BaseDocument} documentType
   */
  public registerDocument(name: string, documentType: BaseDocument) {
    this.documents[name] = documentType;
  }

  /**
   * @returns {undefined}
   */
  protected registerDocuments() {
    if (!this.options.documentsDir || !fs.existsSync(this.options.documentsDir)) {
      return;
    }

    for (const file of fs.readdirSync(this.options.documentsDir)) {
      const content = require(this.options.documentsDir + '/' + file);
      for (const index in content) {
        const document = content[index];
        if (document.prototype instanceof BaseDocument) {
          this.registerDocument(document.name, document);
        }
      }
    }
  }

  /**
   * @returns {any}
   */
  getRegisteredDocuments() {
    return this.documents;
  }

  /**
   * @param {BaseDocument} type
   */
  public getRepository<T extends BaseDocument>(type: any): Repository<T> {
    if (this.repositories[type.name]) {
      return this.repositories[type.name];
    }

    return this.createRepository<T>(type);
  }

  /**
   * @param {BaseDocument} type
   */
  private createRepository<T extends BaseDocument>(type: BaseDocument) {
    const repository = new Repository<T>(type, this);
    this.repositories[type.name] = repository;

    return repository;
  }

}

interface DocumentManagerOptions {
  documentsDir?: string;
}
