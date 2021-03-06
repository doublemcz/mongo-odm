import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import { BaseDocument } from './BaseDocument';
import { Repository } from './Repository';
import { isFunction, isString } from 'util';
import * as fs from 'fs';
import * as path from 'path';

export class DocumentManager {

  /** @type {object} Object with Documents extended from BaseDocument */
  protected documents: any = {};
  /** @type {object} Object with Repositories */
  private repositories: any = {};
  /** @type {Promise<Db>} */
  private readonly db: Promise<Db>;

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
   * @param {MongoClientOptions} mongoClientOptions
   * @returns {Promise<DocumentManager>}
   */
  public static create(options: DocumentManagerOptions, mongoClientOptions?: MongoClientOptions) {
    if (!options.url) {
      options.url = 'mongodb://localhost';
    }

    if (!options.database) {
      throw new Error(`Please specify 'url' and 'database' in options`);
    }

    return new this(MongoClient.connect(options.url, mongoClientOptions), options);
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
   * @returns {Promise<boolean>}
   */
  public async isConnected() {
    const db = await this.getDb();
    const client = await this.mongoClient;

    return client.isConnected(db.databaseName);
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
      if (-1 === ['.js', '.ts'].indexOf(path.extname(realPath))) {
        continue;
      }

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
    let identifier;
    if (isString(type)) {
      identifier = type;
    } else if (isFunction(type)) {
      identifier = type.name;
    } else {
      throw new Error(`Invalid type has been passed to getRepository. Given: '${type}'`);
    }

    if (this.repositories[identifier]) {
      return this.repositories[identifier];
    }

    if (!this.documents[identifier]) {
      throw new Error(`There is not such '${identifier}' document. Did you register it? Maybe the documents dir is not valid.`);
    }

    return this.createRepository<T>(this.documents[identifier]);
  }

  /**
   * @param {any} type A type of an inherited Document from BaseDocument
   */
  private createRepository<T extends BaseDocument>(type: any): Repository<T> {
    let repository;
    const typeInstance = new type();
    if (typeInstance.getOdm().customRepository) {
      // You can pass function or created instance of the repository
      if (typeof typeInstance.getOdm().customRepository === 'object') {
        repository = typeInstance.getOdm().customRepository;
        repository.setDocumentManager(this);
      } else if (typeof typeInstance.getOdm().customRepository === 'function') {
        const customClass = typeInstance.getOdm().customRepository;
        repository = new customClass(type, this);
      } else {
        throw new Error('Do not know what the repository is. You must give me type or instance');
      }
    } else {
      repository = new Repository<T>(type, this);
    }

    this.repositories[type.name] = repository;

    return repository;
  }

}

export interface DocumentManagerOptions {
  url?: string,
  database?: string,
  documentsDir?: string;
}
