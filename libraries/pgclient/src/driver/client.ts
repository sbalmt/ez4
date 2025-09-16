import type { PgClientDriver, PgExecuteOptions, PgExecuteStatement } from '@ez4/pgclient';
import type { AnySchema } from '@ez4/schema';
import type { Pool, PoolClient } from 'pg';

import { randomUUID } from 'crypto';

import { logQueryError, logQuerySuccess } from './logger';
import { detectFieldData, prepareFieldData } from './fields';
import { prepareStatement } from './prepare';
import { parseRecords } from './records';

const ActiveClients: Record<string, PoolClient> = {};

export class ClientDriver implements PgClientDriver {
  #pool: Pool;

  constructor(pool: Pool) {
    this.#pool = pool;
  }

  async executeStatement(statement: PgExecuteStatement, options?: PgExecuteOptions) {
    const transactionId = options?.transactionId;

    const client = transactionId ? ActiveClients[transactionId] : await this.#pool.connect();

    if (!client) {
      throw new Error(`Transaction '${transactionId}' wasn't found.`);
    }

    try {
      const [query, variables] = prepareStatement(statement.query, statement.variables);

      const { rows: records, rowCount: rows } = await client.query(query, variables);

      if (options?.debug) {
        logQuerySuccess(statement, transactionId);
      }

      const metadata = statement.metadata;

      if (metadata) {
        return {
          records: parseRecords(records, metadata),
          rows
        };
      }

      return {
        records,
        rows
      };
    } catch (error) {
      logQueryError(statement, transactionId);

      throw error;
      //
    } finally {
      if (!transactionId) {
        client.release();
      }
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
      //
      await this.rollbackTransaction(transactionId);
      throw error;
    }
  }

  async beginTransaction() {
    const transactionId = randomUUID();
    const client = await this.#pool.connect();

    try {
      await client.query('BEGIN');
      ActiveClients[transactionId] = client;
      return transactionId;
    } catch (error) {
      client.release();
      throw error;
    }
  }

  async commitTransaction(transactionId: string) {
    const client = ActiveClients[transactionId];

    if (!client) {
      throw new Error(`Transaction '${transactionId}' wasn't found, unable to commit.`);
    }

    try {
      await client.query('COMMIT');
    } catch (error) {
      throw error;
    } finally {
      delete ActiveClients[transactionId];
      client.release();
    }
  }

  async rollbackTransaction(transactionId: string) {
    const client = ActiveClients[transactionId];

    if (!client) {
      throw new Error(`Transaction '${transactionId}' wasn't found, unable to rollback.`);
    }

    try {
      await client.query('ROLLBACK');
    } catch (error) {
      throw error;
    } finally {
      delete ActiveClients[transactionId];
      client.release();
    }
  }

  prepareVariable(name: string, value: unknown, schema?: AnySchema) {
    if (schema) {
      return prepareFieldData(name, value, schema);
    }

    return detectFieldData(name, value);
  }
}
