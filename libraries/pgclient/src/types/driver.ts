import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';
import type { PgRelationRepositoryWithSchema } from './repository';

export type PgExecuteOptions = {
  transactionId?: string;
  silent?: boolean;
  debug?: boolean;
};

export type PgStatementMetadata = {
  table: string;
  relations: PgRelationRepositoryWithSchema;
  schema: ObjectSchema;
};

export type PgExecuteStatement = {
  metadata?: PgStatementMetadata;
  variables?: any[];
  query: string;
};

export type PgExecutionResult = {
  records: AnyObject[];
  rows?: number | null;
};

/**
 * Common interface to access a Postgres database.
 */
export interface PgClientDriver {
  /**
   * Execute a single statement.
   *
   * @param statement SQL statement.
   * @param options Execution options.
   */
  executeStatement(statement: PgExecuteStatement, options?: PgExecuteOptions): Promise<PgExecutionResult>;

  /**
   * Execute multiple statements.
   *
   * @param statements SQL statements.
   * @param options Execution options.
   */
  executeStatements(statements: PgExecuteStatement[], options?: PgExecuteOptions): Promise<PgExecutionResult[]>;

  /**
   * Open a transaction and execute multiple statements.
   *
   * @param statements SQL statements.
   * @param options Execution options.
   */
  executeTransaction(statements: PgExecuteStatement[], options?: PgExecuteOptions): Promise<PgExecutionResult[]>;

  /**
   * Begin a new transaction and return its identifier.
   */
  beginTransaction(): Promise<string>;

  /**
   * Commit the transaction associated to the given Id.
   *
   * @param transactionId Transaction Id.
   */
  commitTransaction(transactionId: string): Promise<void>;

  /**
   * Rollback the transaction associated to the given Id.
   *
   * @param transactionId Transaction Id.
   */
  rollbackTransaction(transactionId: string): Promise<void>;

  /**
   * Prepare a variable to be used within a statement.
   *
   * @param name Variable name.
   * @param value Variable value.
   * @param schema Value schema.
   */
  prepareVariable(name: string, value: unknown, schema?: AnySchema): unknown;
}
