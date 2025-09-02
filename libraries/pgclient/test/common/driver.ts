import type { PgClientDriver, PgExecuteOptions, PgExecuteStatement } from '@ez4/pgclient';
import type { AnySchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

export class PgTestClientDriver implements PgClientDriver {
  executeStatement(_statement: PgExecuteStatement, _options?: PgExecuteOptions): Promise<AnyObject[]> {
    return Promise.resolve([]);
  }

  executeStatements(_statements: PgExecuteStatement[], _options?: PgExecuteOptions): Promise<AnyObject[][]> {
    return Promise.resolve([]);
  }

  executeTransaction(_statements: PgExecuteStatement[], _options?: PgExecuteOptions): Promise<AnyObject[][]> {
    return Promise.resolve([]);
  }

  beginTransaction(): Promise<string> {
    return Promise.resolve('pg-test');
  }

  commitTransaction(_transactionId: string): Promise<void> {
    return Promise.resolve();
  }

  rollbackTransaction(_transactionId: string): Promise<void> {
    return Promise.resolve();
  }

  prepareVariable(name: string, value: unknown, _schema?: AnySchema): unknown {
    return {
      name,
      value
    };
  }
}
