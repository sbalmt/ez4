import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

import {
  DynamoDBClient,
  CreateTableCommand,
  ConditionalCheckFailedException,
  ResourceInUseException,
  BillingMode,
  waitUntilTableExists
} from '@aws-sdk/client-dynamodb';

import { userInfo } from 'node:os';

import { getAwsClientOptions, getAwsClientWaiter } from '../utils/clients';
import { getRandomName } from '../utils/names';

const dynamoDbClient = new DynamoDBClient(getAwsClientOptions());

const dynamoDbWaiter = {
  ...getAwsClientWaiter(),
  client: dynamoDbClient
};

export const acquireExclusiveLock = async (lockId: string) => {
  const tableName = await getLockTableName();

  const client = await ensureLockTableExists(tableName);

  try {
    await client.send(
      new PutCommand({
        TableName: tableName,
        ConditionExpression: 'attribute_not_exists(lock_id)',
        Item: {
          created_at: new Date().toISOString(),
          user_name: userInfo().username,
          lock_id: lockId
        }
      })
    );

    return true;
    //
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      return false;
    }

    throw error;
  }
};

export const releaseExclusiveLock = async (lockId: string) => {
  const tableName = await getLockTableName();

  const client = await ensureLockTableExists(tableName);

  await client.send(
    new DeleteCommand({
      TableName: tableName,
      Key: {
        lock_id: lockId
      }
    })
  );
};

const ensureLockTableExists = async (tableName: string) => {
  try {
    await dynamoDbClient.send(
      new CreateTableCommand({
        TableName: tableName,
        BillingMode: BillingMode.PAY_PER_REQUEST,
        AttributeDefinitions: [
          {
            AttributeName: 'lock_id',
            AttributeType: 'S'
          }
        ],
        KeySchema: [
          {
            AttributeName: 'lock_id',
            KeyType: 'HASH'
          }
        ]
      })
    );

    await waitUntilTableExists(dynamoDbWaiter, {
      TableName: tableName
    });

    //
  } catch (error) {
    if (!(error instanceof ResourceInUseException)) {
      throw error;
    }
  }

  return DynamoDBDocumentClient.from(dynamoDbClient);
};

const getLockTableName = async () => {
  const randomName = await getRandomName(16);

  return `ez4-${randomName}`;
};
