import { Db, MongoClient } from 'mongodb';
import { BaseDocument } from './BaseDocument';
import * as fs from 'fs';
import { Repository } from './Repository';

export class DocumentManager {

  /** @type {object} Object with Documents extended from BaseDocument */
  protected documents: any = {};
  /** @type {object} Object with Repositories */
  private repositories: any = {};
  /** @type {Promise<Db>} */
  private db: Promise<Db>;

  /**
   * @param {Promise<Db>} mongoClient
   * @param {DocumentManagerOptions} options
   */
  public constructor(protected mongoClient: Promise<MongoClient>, private options: DocumentManagerOptions) {
    this.registerDocuments();
    const database = options.database;
    if (!database) {
      throw new Error(`You must set 'database' in options`);
    }

    this.db = this.mongoClient.then(mongoClient => mongoClient.db(database));
  }

  /**
   * @param {DocumentManagerOptions} options
   * @returns {Promise<DocumentManager>}
   */
  public static create(options: DocumentManagerOptions) {
    if (!options.url) {
      throw new Error(`Please specify 'url' and 'database' in options`);
    }

    if (!options.database) {
      throw new Error(`Please specify 'url' and 'database' in options`);
    }

    return new this(MongoClient.connect(options.url), options);
  }

  /**
   * @returns {Promise<Db>}
   */
  public getDb(): Promise<Db> {
    return this.db;
  }

  /**
   * @returns {Promise<Db>}
   */
  public getMongoClient(): Promise<MongoClient> {
    return this.mongoClient;
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
      const realPath = fs.realpathSync(this.options.documentsDir + '/' + file);
      const content = require(realPath);
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

export interface DocumentManagerOptions {
  url?: string,
  database?: string,
  documentsDir?: string;
}
