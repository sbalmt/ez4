import type { PgClientDriver, PgExecuteOptions, PgExecuteStatement } from '@ez4/pgclient';
import type { AnySchema } from '@ez4/schema';
import type { Arn } from '@ez4/aws-common';

import {
  RDSDataClient,
  BeginTransactionCommand,
  RollbackTransactionCommand,
  CommitTransactionCommand,
  ExecuteStatementCommand,
  DecimalReturnType,
  LongReturnType
} from '@aws-sdk/client-rds-data';

import { DatabaseResumingException } from '@aws-sdk/client-rds-data';
import { DuplicateUniqueKeyError, parseRecords } from '@ez4/pgclient';
import { Runtime } from '@ez4/common';
import { Wait } from '@ez4/utils';

import { detectFieldData, prepareFieldData, parseFieldRecords } from '../fields';
import { isAuthenticationException, isDuplicateUniqueKeyException } from '../errors';
import { logQueryError, logQuerySuccess } from '../logger';

const client = new RDSDataClient({
  retryMode: 'adaptive',
  maxAttempts: 10
});

export type ApiClientConnection = {
  secretArn: Arn;
  resourceArn: Arn;
  database: string;
};

export class ApiClientDriver implements PgClientDriver {
  constructor(private connection: ApiClientConnection) {}

  async executeStatement(statement: PgExecuteStatement, options?: PgExecuteOptions) {
    const transactionId = options?.transactionId;

    try {
      return await withRetryOnFailures(async () => {
        const result = await client.send(
          new ExecuteStatementCommand({
            ...this.connection,
            includeResultMetadata: true,
            continueAfterTimeout: options?.noTimeout,
            parameters: statement.variables,
            sql: statement.query,
            transactionId,
            resultSetOptions: {
              decimalReturnType: DecimalReturnType.DOUBLE_OR_LONG,
              longReturnType: LongReturnType.LONG
            }
          })
        );

        const { records: rawRecords, columnMetadata, numberOfRecordsUpdated } = result;

        if (options?.debug || Runtime.isDebug()) {
          logQuerySuccess(statement, transactionId);
        }

        if (!rawRecords || !columnMetadata) {
          return {
            rows: numberOfRecordsUpdated,
            records: []
          };
        }

        const records = parseFieldRecords(rawRecords, columnMetadata);
        const metadata = statement.metadata;

        if (metadata) {
          return {
            records: parseRecords(records, metadata),
            rows: numberOfRecordsUpdated
          };
        }

        return {
          rows: numberOfRecordsUpdated,
          records
        };
      });
    } catch (error) {
      if (!options?.noErrorLog) {
        logQueryError(statement, transactionId);
      }

      if (isDuplicateUniqueKeyException(error)) {
        throw new DuplicateUniqueKeyError();
      }

      throw error;
    }
  }

  async executeStatements(statements: PgExecuteStatement[], options?: PgExecuteOptions) {
    const results = [];

    for (const statement of statements) {
      const result = await this.executeStatement(statement, options);

      results.push(result);
    }

    return results;
  }

  async executeTransaction(statements: PgExecuteStatement[], options?: PgExecuteOptions) {
    const transactionId = await this.beginTransaction();

    try {
      const results = await this.executeStatements(statements, {
        ...options,
        transactionId
      });

      await this.commitTransaction(transactionId);

      return results;
    } catch (error) {
      await this.rollbackTransaction(transactionId);

      throw error;
    }
  }

  async beginTransaction() {
    return withRetryOnFailures(async () => {
      const { transactionId } = await client.send(new BeginTransactionCommand(this.connection));

      return transactionId!;
    });
  }

  async commitTransaction(transactionId: string) {
    await client.send(
      new CommitTransactionCommand({
        ...this.connection,
        transactionId
      })
    );
  }

  async rollbackTransaction(transactionId: string) {
    await client.send(
      new RollbackTransactionCommand({
        ...this.connection,
        transactionId
      })
    );
  }

  prepareVariable(name: string, value: unknown, schema?: AnySchema) {
    if (schema) {
      return prepareFieldData(name, value, schema);
    }

    return detectFieldData(name, value);
  }
}

const withRetryOnFailures = async <T>(callback: () => Promise<T>) => {
  return Wait.until(
    async () => {
      try {
        return await callback();
      } catch (error) {
        if (error instanceof DatabaseResumingException) {
          return Wait.RetryAttempt;
        }

        if (isAuthenticationException(error)) {
          return Wait.RetryAttempt;
        }

        throw error;
      }
    },
    {
      minDelay: 1,
      maxDelay: 10,
      attempts: 5
    }
  );
};
