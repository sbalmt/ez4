import type { DynamoDBDocumentClient, ExecuteStatementCommandInput } from '@aws-sdk/lib-dynamodb';

import { ExecuteStatementCommand } from '@aws-sdk/lib-dynamodb';
import { ExecuteTransactionCommand } from '@aws-sdk/lib-dynamodb';

export const executeStatement = async (
  client: DynamoDBDocumentClient,
  command: ExecuteStatementCommandInput
) => {
  const result = await client.send(
    new ExecuteStatementCommand({
      ...command
    })
  );

  return result;
};

export const executeTransactions = async (client: DynamoDBDocumentClient, transactions: any[]) => {
  const maxLength = transactions.length;
  const operations = [];
  const batchSize = 100;

  for (let offset = 0; offset < maxLength; offset += batchSize) {
    const command = new ExecuteTransactionCommand({
      TransactStatements: transactions.slice(offset, offset + batchSize)
    });

    operations.push(client.send(command));
  }

  const result = await Promise.all(operations);

  return result.flat();
};
