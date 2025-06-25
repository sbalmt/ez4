import type { RDSDataClient } from '@aws-sdk/client-rds-data';
import type { AnyObject } from '@ez4/utils';
import type { PreparedQueryCommand } from './queries.js';
import type { Connection } from '../types.js';

import { setTimeout } from 'node:timers/promises';

import {
  DatabaseResumingException,
  BeginTransactionCommand,
  RollbackTransactionCommand,
  CommitTransactionCommand,
  ExecuteStatementCommand,
  RecordsFormatType,
  DecimalReturnType,
  LongReturnType
} from '@aws-sdk/client-rds-data';

export type ExecuteOptions = {
  transactionId?: string;
  debug?: boolean;
};

export const executeStatement = async (
  client: RDSDataClient,
  connection: Connection,
  command: PreparedQueryCommand,
  options?: ExecuteOptions
): Promise<AnyObject[]> => {
  const transactionId = options?.transactionId;

  try {
    return await callWithRetryOnResume(async () => {
      const { formattedRecords } = await client.send(
        new ExecuteStatementCommand({
          formatRecordsAs: RecordsFormatType.JSON,
          resultSetOptions: {
            decimalReturnType: DecimalReturnType.DOUBLE_OR_LONG,
            longReturnType: LongReturnType.LONG
          },
          transactionId,
          ...connection,
          ...command
        })
      );

      if (options?.debug) {
        console.debug({
          query: command.sql,
          transaction: getDebugTransactionId(transactionId),
          type: 'PgSQL'
        });
      }

      if (formattedRecords) {
        return JSON.parse(formattedRecords);
      }

      return [];
    });
  } catch (error) {
    console.error({
      query: command.sql,
      transaction: getDebugTransactionId(transactionId),
      type: 'PgSQL'
    });

    throw error;
  }
};

export const executeStatements = async (
  client: RDSDataClient,
  connection: Connection,
  commands: PreparedQueryCommand[],
  options?: ExecuteOptions
) => {
  const results = [];

  for (const command of commands) {
    const result = await executeStatement(client, connection, command, options);

    results.push(result);
  }

  return results;
};

export const executeTransaction = async (
  client: RDSDataClient,
  connection: Connection,
  commands: PreparedQueryCommand[],
  options?: ExecuteOptions
) => {
  const transactionId = await beginTransaction(client, connection);

  try {
    const results = await executeStatements(client, connection, commands, {
      ...options,
      transactionId
    });

    await commitTransaction(client, connection, transactionId);

    return results;
  } catch (error) {
    await rollbackTransaction(client, connection, transactionId);

    throw error;
  }
};

export const beginTransaction = async (client: RDSDataClient, connection: Connection) => {
  return callWithRetryOnResume(async () => {
    const { transactionId } = await client.send(
      new BeginTransactionCommand({
        ...connection
      })
    );

    return transactionId!;
  });
};

export const rollbackTransaction = async (client: RDSDataClient, connection: Connection, transactionId: string) => {
  await client.send(
    new RollbackTransactionCommand({
      ...connection,
      transactionId
    })
  );
};

export const commitTransaction = async (client: RDSDataClient, connection: Connection, transactionId: string) => {
  await client.send(
    new CommitTransactionCommand({
      ...connection,
      transactionId
    })
  );
};

const getDebugTransactionId = (transactionId: string | undefined) => {
  return transactionId?.substring(0, 8) ?? '-';
};

const callWithRetryOnResume = async <T>(callback: () => Promise<T>) => {
  for (let milliseconds = 4500; ; milliseconds -= 500) {
    try {
      return await callback();
    } catch (error) {
      if (error instanceof DatabaseResumingException && milliseconds > 0) {
        await setTimeout(milliseconds);
        continue;
      }

      throw error;
    }
  }
};
