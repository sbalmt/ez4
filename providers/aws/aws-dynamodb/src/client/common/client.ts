import type { DynamoDBDocumentClient, ExecuteStatementCommandInput } from '@aws-sdk/lib-dynamodb';
import type { ConsumedCapacity } from '@aws-sdk/client-dynamodb';
import type { AnyObject } from '@ez4/utils';

import { ReturnConsumedCapacity } from '@aws-sdk/client-dynamodb';
import { ExecuteTransactionCommand } from '@aws-sdk/lib-dynamodb';
import { ExecuteStatementCommand } from '@aws-sdk/lib-dynamodb';
import { Runtime } from '@ez4/common';

export type StatementResult = {
  cursor?: string;
  records: any[];
};

export const executeStatement = async (
  client: DynamoDBDocumentClient,
  command: ExecuteStatementCommandInput,
  debug?: boolean
): Promise<StatementResult> => {
  try {
    const result = await client.send(
      new ExecuteStatementCommand({
        ReturnConsumedCapacity: debug ? ReturnConsumedCapacity.TOTAL : ReturnConsumedCapacity.NONE,
        ...command
      })
    );

    if (debug) {
      logQuerySuccess(command, result.ConsumedCapacity);
    }

    const records = result.Items ?? [];

    if (!result.NextToken) {
      return {
        records
      };
    }

    const limit = command.Limit;

    if (limit && limit === records.length) {
      return {
        cursor: result.NextToken,
        records
      };
    }

    const nextLimit = limit ? limit - records.length : undefined;

    const nextCommand: ExecuteStatementCommandInput = {
      ...command,
      NextToken: result.NextToken,
      Limit: nextLimit
    };

    const nextResult = await executeStatement(client, nextCommand, debug);

    return {
      ...nextResult,
      records: [...records, ...nextResult.records]
    };
  } catch (error) {
    logQueryError(command);

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
        commandList.forEach((command) => logQuerySuccess(command, consumption, true));
      }
    } catch (error) {
      commandList.forEach((command) => logQueryError(command, true));

      throw error;
    }
  }
};

const logQuerySuccess = (input: ExecuteStatementCommandInput, consumption: ConsumedCapacity | undefined, transaction?: boolean) => {
  const parameters = getDebugParameters(input);

  console.debug({
    type: 'PartiQL',
    ...Runtime.getScope(),
    consumption: consumption?.CapacityUnits,
    query: input.Statement,
    ...(transaction && {
      transaction
    }),
    ...(parameters && {
      parameters
    })
  });
};

const logQueryError = (input: ExecuteStatementCommandInput, transaction?: boolean) => {
  const parameters = getDebugParameters(input);

  console.error({
    type: 'PartiQL',
    ...Runtime.getScope(),
    query: input.Statement,
    ...(parameters && {
      parameters
    }),
    ...(transaction && {
      transaction
    })
  });
};

const getDebugParameters = (input: ExecuteStatementCommandInput) => {
  if (!Runtime.getScope()?.isLocal || !input.Parameters?.length) {
    return undefined;
  }

  const parameters: AnyObject = {};

  input.Parameters.forEach((variable, index) => {
    parameters[index] = variable;
  });

  return parameters;
};
