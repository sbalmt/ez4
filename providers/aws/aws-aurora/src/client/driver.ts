import type { PgClientDriver, PgExecuteOptions, PgExecuteStatement } from '@ez4/pgclient';
import type { AnySchema } from '@ez4/schema';
import type { Arn } from '@ez4/aws-common';

import {
  RDSDataClient,
  BeginTransactionCommand,
  RollbackTransactionCommand,
  CommitTransactionCommand,
  ExecuteStatementCommand,
  RecordsFormatType,
  DecimalReturnType,
  LongReturnType
} from '@aws-sdk/client-rds-data';

import { DatabaseResumingException } from '@aws-sdk/client-rds-data';
import { parseRecords } from '@ez4/pgclient';

import { setTimeout } from 'node:timers/promises';

import { detectFieldData, prepareFieldData } from './fields';
import { logQueryError, logQuerySuccess } from './logger';

const client = new RDSDataClient({
  retryMode: 'adaptive',
  maxAttempts: 10
});

export type DataClientConnection = {
  resourceArn: Arn;
  secretArn: Arn;
  database: string;
};

export class DataClientDriver implements PgClientDriver {
  constructor(private connection: DataClientConnection) {}

  async executeStatement(statement: PgExecuteStatement, options?: PgExecuteOptions) {
    const transactionId = options?.transactionId;

    try {
      return await withRetryOnResume(async () => {
        const { formattedRecords, numberOfRecordsUpdated } = await client.send(
          new ExecuteStatementCommand({
            ...this.connection,
            formatRecordsAs: RecordsFormatType.JSON,
            sql: statement.query,
            parameters: statement.variables,
            transactionId,
            resultSetOptions: {
              decimalReturnType: DecimalReturnType.DOUBLE_OR_LONG,
              longReturnType: LongReturnType.LONG
            }
          })
        );

        if (options?.debug) {
          logQuerySuccess(statement, transactionId);
        }

        if (!formattedRecords) {
          return {
            rows: numberOfRecordsUpdated,
            records: []
          };
        }

        const records = JSON.parse(formattedRecords);
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
      if (!options?.silent) {
        logQueryError(statement, transactionId);
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
    return withRetryOnResume(async () => {
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

/**
 * Perform the given callback and retry in case of failure due to a resume exception.
 * In every retry, `500ms` will be decreased from the initial timeout until it reaches zero.
 * When the initial timeout reaches zero, the original exception is thrown.
 *
 * @param callback Callback performed in every retry.
 * @returns Returns the callback result.
 */
const withRetryOnResume = async <T>(callback: () => Promise<T>) => {
  for (let timeout = 4500; ; timeout -= 500) {
    try {
      return await callback();
    } catch (error) {
      if (error instanceof DatabaseResumingException && timeout > 0) {
        await setTimeout(timeout);
        continue;
      }

      throw error;
    }
  }
};
