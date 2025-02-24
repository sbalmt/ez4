import type { RDSDataClient } from '@aws-sdk/client-rds-data';
import type { PreparedQueryCommand } from './queries.js';
import type { Connection } from '../types.js';

import {
  RecordsFormatType,
  DecimalReturnType,
  LongReturnType,
  BeginTransactionCommand,
  CommitTransactionCommand,
  ExecuteStatementCommand,
  RollbackTransactionCommand
} from '@aws-sdk/client-rds-data';

export const beginTransaction = async (client: RDSDataClient, connection: Connection) => {
  const result = await client.send(
    new BeginTransactionCommand({
      ...connection
    })
  );

  return result.transactionId!;
};

export const rollbackTransaction = async (
  client: RDSDataClient,
  connection: Connection,
  transactionId: string
) => {
  await client.send(
    new RollbackTransactionCommand({
      ...connection,
      transactionId
    })
  );
};

export const commitTransaction = async (
  client: RDSDataClient,
  connection: Connection,
  transactionId: string
) => {
  await client.send(
    new CommitTransactionCommand({
      ...connection,
      transactionId
    })
  );
};

export const executeStatement = async (
  client: RDSDataClient,
  connection: Connection,
  command: PreparedQueryCommand,
  transactionId?: string,
  debug?: boolean
) => {
  try {
    if (debug) {
      const debugId = transactionId?.substring(0, 4) ?? '-';

      console.debug(`[PgSQL/${debugId}]:`, command.sql);
    }

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

    if (formattedRecords) {
      return JSON.parse(formattedRecords);
    }
  } catch (e) {
    console.debug(command.sql);

    throw e;
  }
};

export const executeTransaction = async (
  client: RDSDataClient,
  connection: Connection,
  commands: PreparedQueryCommand[],
  debug?: boolean
) => {
  const transactionId = await beginTransaction(client, connection);
  const resultRecords = [];

  try {
    for (const command of commands) {
      const records = await executeStatement(client, connection, command, transactionId, debug);

      resultRecords.push(records);
    }

    await commitTransaction(client, connection, transactionId);
  } catch (error) {
    await rollbackTransaction(client, connection, transactionId);

    throw error;
  }

  return resultRecords;
};
