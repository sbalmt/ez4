import type { DynamoDBDocumentClient, ExecuteStatementCommandInput } from '@aws-sdk/lib-dynamodb';
import type { ConsumedCapacity } from '@aws-sdk/client-dynamodb';

import { ReturnConsumedCapacity } from '@aws-sdk/client-dynamodb';
import { ExecuteTransactionCommand } from '@aws-sdk/lib-dynamodb';
import { ExecuteStatementCommand } from '@aws-sdk/lib-dynamodb';

export const executeStatement = async (client: DynamoDBDocumentClient, command: ExecuteStatementCommandInput, debug?: boolean) => {
  try {
    const result = await client.send(
      new ExecuteStatementCommand({
        ReturnConsumedCapacity: debug ? ReturnConsumedCapacity.TOTAL : ReturnConsumedCapacity.NONE,
        ...command
      })
    );

    if (debug) {
      logStatement(command, result.ConsumedCapacity);
    }

    return result;
  } catch (error) {
    logError(command);
    throw error;
  }
};

export const executeTransaction = async (client: DynamoDBDocumentClient, statements: ExecuteStatementCommandInput[], debug?: boolean) => {
  const maxLength = statements.length;
  const batchSize = 100;

  for (let offset = 0; offset < maxLength; offset += batchSize) {
    const commandList = statements.slice(offset, offset + batchSize);

    try {
      const command = new ExecuteTransactionCommand({
        ReturnConsumedCapacity: debug ? ReturnConsumedCapacity.TOTAL : ReturnConsumedCapacity.NONE,
        TransactStatements: commandList
      });

      const result = await client.send(command);

      if (debug) {
        const consumption = result.ConsumedCapacity?.[0];
        commandList.forEach((command) => logStatement(command, consumption, true));
      }
    } catch (error) {
      commandList.forEach((command) => logError(command));

      throw error;
    }
  }
};

const logStatement = (input: ExecuteStatementCommandInput, consumption: ConsumedCapacity | undefined, transaction?: boolean) => {
  console.debug({
    query: input.Statement,
    consumption: consumption?.CapacityUnits,
    transaction,
    type: 'PartiQL'
  });
};

const logError = (input: ExecuteStatementCommandInput) => {
  console.error({
    query: input.Statement,
    type: 'PartiQL'
  });
};
