import type { DynamoDBDocumentClient, ExecuteStatementCommandInput } from '@aws-sdk/lib-dynamodb';

import { ExecuteStatementCommand } from '@aws-sdk/lib-dynamodb';
import { ExecuteTransactionCommand } from '@aws-sdk/lib-dynamodb';

export const executeStatement = async (
  client: DynamoDBDocumentClient,
  command: ExecuteStatementCommandInput,
  debug?: boolean
) => {
  try {
    if (debug) {
      console.debug(`[PartiQL/-]:`, command.Statement);
    }

    const result = await client.send(
      new ExecuteStatementCommand({
        ...command
      })
    );

    return result;
  } catch (e) {
    console.debug(command.Statement);

    throw e;
  }
};

export const executeTransaction = async (
  client: DynamoDBDocumentClient,
  statements: any[],
  debug?: boolean
) => {
  const maxLength = statements.length;
  const operations = [];
  const batchSize = 100;

  for (let offset = 0; offset < maxLength; offset += batchSize) {
    const commandList = statements.slice(offset, offset + batchSize);

    if (debug) {
      const transactionId = Math.trunc(Math.random() * 1000).toString();
      const debugId = transactionId.padStart(4, '0');

      commandList.forEach((command) => {
        console.debug(`[PartiQL/${debugId}]:`, command.Statement);
      });
    }

    const command = new ExecuteTransactionCommand({
      TransactStatements: commandList
    });

    operations.push(client.send(command));
  }

  const result = await Promise.all(operations);

  return result.flat();
};
