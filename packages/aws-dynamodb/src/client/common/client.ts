import type { DynamoDBDocumentClient, ExecuteStatementCommandInput } from '@aws-sdk/lib-dynamodb';

import { ExecuteStatementCommand } from '@aws-sdk/lib-dynamodb';
import { ExecuteTransactionCommand } from '@aws-sdk/lib-dynamodb';

export const executeStatement = async (
  client: DynamoDBDocumentClient,
  command: ExecuteStatementCommandInput
) => {
  try {
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

export const executeTransaction = async (client: DynamoDBDocumentClient, statements: any[]) => {
  const maxLength = statements.length;
  const operations = [];
  const batchSize = 100;

  for (let offset = 0; offset < maxLength; offset += batchSize) {
    const command = new ExecuteTransactionCommand({
      TransactStatements: statements.slice(offset, offset + batchSize)
    });

    operations.push(client.send(command));
  }

  const result = await Promise.all(operations);

  return result.flat();
};
