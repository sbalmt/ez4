import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { ExecuteTransactionCommand } from '@aws-sdk/lib-dynamodb';

export const batchTransactions = async (client: DynamoDBDocumentClient, transactions: any[]) => {
  const maxLength = transactions.length;
  const operations = [];
  const batchSize = 100;

  for (let offset = 0; offset < maxLength; offset += batchSize) {
    const command = new ExecuteTransactionCommand({
      TransactStatements: transactions.slice(offset, offset + batchSize)
    });

    operations.push(client.send(command));
  }

  await Promise.all(operations);
};
