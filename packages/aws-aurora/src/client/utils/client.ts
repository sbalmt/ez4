import type { RDSDataClient } from '@aws-sdk/client-rds-data';
import type { PreparedQueryCommand } from './query.js';
import type { Configuration } from '../types.js';

import {
  BeginTransactionCommand,
  CommitTransactionCommand,
  ExecuteStatementCommand,
  RollbackTransactionCommand,
  RecordsFormatType
} from '@aws-sdk/client-rds-data';

export const executeStatement = async (
  configuration: Configuration,
  client: RDSDataClient,
  command: PreparedQueryCommand,
  transactionId?: string
) => {
  const { formattedRecords } = await client.send(
    new ExecuteStatementCommand({
      formatRecordsAs: RecordsFormatType.JSON,
      transactionId,
      ...configuration,
      ...command
    })
  );

  if (formattedRecords) {
    return JSON.parse(formattedRecords);
  }
};

export const beginTransaction = async (configuration: Configuration, client: RDSDataClient) => {
  const result = await client.send(
    new BeginTransactionCommand({
      ...configuration
    })
  );

  return result.transactionId!;
};

export const commitTransaction = async (
  configuration: Configuration,
  client: RDSDataClient,
  transactionId: string
) => {
  await client.send(
    new CommitTransactionCommand({
      ...configuration,
      transactionId
    })
  );
};

export const rollbackTransaction = async (
  configuration: Configuration,
  client: RDSDataClient,
  transactionId: string
) => {
  await client.send(
    new RollbackTransactionCommand({
      ...configuration,
      transactionId
    })
  );
};

export const batchTransaction = async (
  configuration: Configuration,
  client: RDSDataClient,
  commands: PreparedQueryCommand[]
) => {
  const transactionId = await beginTransaction(configuration, client);
  const results = [];

  try {
    for (const command of commands) {
      const records = await executeStatement(configuration, client, command, transactionId);

      results.push(records);
    }

    await commitTransaction(configuration, client, transactionId);
  } catch (error) {
    await rollbackTransaction(configuration, client, transactionId);

    throw error;
  }

  return results;
};
