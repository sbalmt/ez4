import type { Arn, Logger, ResourceTags } from '@ez4/aws-common';
import type { AttributeSchemaGroup } from '../types/schema';

import { getTagList, waitDeletion } from '@ez4/aws-common';

import {
  DynamoDBClient,
  DescribeTableCommand,
  CreateTableCommand,
  UpdateTableCommand,
  DeleteTableCommand,
  UpdateTimeToLiveCommand,
  TagResourceCommand,
  UntagResourceCommand,
  waitUntilTableExists,
  waitUntilTableNotExists,
  ResourceNotFoundException,
  StreamViewType,
  BillingMode
} from '@aws-sdk/client-dynamodb';

import { getAttributeDefinitions, getAttributeKeyTypes } from './helpers/schema';
import { getSecondaryIndexes, getSecondaryIndexName, waitForSecondaryIndex } from './helpers/indexes';
import { waitForTimeToLive } from './helpers/ttl';

const client = new DynamoDBClient({});

const waiter = {
  minDelay: 15,
  maxWaitTime: 3600,
  maxDelay: 60,
  client
};

export type CapacityUnits = {
  maxReadUnits: number;
  maxWriteUnits: number;
};

export type CreateRequest = {
  tableName: string;
  attributeSchema: AttributeSchemaGroup[];
  capacityUnits?: CapacityUnits;
  allowDeletion?: boolean;
  enableStreams?: boolean;
  tags?: ResourceTags;
};

export type CreateResponse = {
  tableName: string;
  streamArn?: Arn;
  tableArn: Arn;
};

export type UpdateIndexesRequest = {
  toCreate: AttributeSchemaGroup[];
  toRemove: AttributeSchemaGroup[];
};

export type UpdateTimeToLiveRequest = {
  enabled: boolean;
  attributeName: string;
};

export const createTable = async (logger: Logger.OperationLogger, request: CreateRequest): Promise<CreateResponse> => {
  logger.update(`Creating table`);

  const { attributeSchema, capacityUnits, enableStreams } = request;

  const [primarySchema, ...secondarySchema] = attributeSchema;

  const maxWU = capacityUnits?.maxWriteUnits;
  const maxRU = capacityUnits?.maxReadUnits;

  const hasMaximumRWU = maxWU && maxRU;

  const response = await client.send(
    new CreateTableCommand({
      TableName: request.tableName,
      DeletionProtectionEnabled: !request.allowDeletion,
      AttributeDefinitions: getAttributeDefinitions([...(secondarySchema ?? []).flat(), ...primarySchema]),
      KeySchema: getAttributeKeyTypes(primarySchema),
      BillingMode: BillingMode.PAY_PER_REQUEST,
      StreamSpecification: {
        StreamEnabled: !!enableStreams,
        ...(enableStreams && {
          StreamViewType: StreamViewType.NEW_AND_OLD_IMAGES
        })
      },
      ...(secondarySchema?.length && {
        GlobalSecondaryIndexes: getSecondaryIndexes(...secondarySchema)
      }),
      ...(hasMaximumRWU && {
        OnDemandThroughput: {
          MaxWriteRequestUnits: maxWU,
          MaxReadRequestUnits: maxRU
        }
      }),
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  const tableDescription = response.TableDescription!;
  const tableName = tableDescription.TableName!;

  await waitUntilTableExists(waiter, {
    TableName: tableName
  });

  return {
    tableName,
    streamArn: tableDescription.LatestStreamArn as Arn,
    tableArn: tableDescription.TableArn as Arn
  };
};

export const updateStreams = async (logger: Logger.OperationLogger, tableName: string, enableStreams: boolean) => {
  logger.update(`Updating table event stream`);

  const response = await client.send(
    new UpdateTableCommand({
      TableName: tableName,
      StreamSpecification: {
        StreamEnabled: enableStreams,
        ...(enableStreams && {
          StreamViewType: StreamViewType.NEW_AND_OLD_IMAGES
        })
      }
    })
  );

  const tableDescription = response.TableDescription!;

  return {
    streamArn: tableDescription.LatestStreamArn as Arn
  };
};

export const updateCapacity = async (logger: Logger.OperationLogger, tableName: string, request: CapacityUnits | undefined) => {
  logger.update(`Updating table capacity`);

  await client.send(
    new UpdateTableCommand({
      TableName: tableName,
      BillingMode: BillingMode.PAY_PER_REQUEST,
      OnDemandThroughput: {
        MaxWriteRequestUnits: request?.maxWriteUnits ?? -1,
        MaxReadRequestUnits: request?.maxReadUnits ?? -1
      }
    })
  );
};

export const updateDeletion = async (logger: Logger.OperationLogger, tableName: string, allowDeletion: boolean) => {
  logger.update(`Updating deletion protection`);

  await client.send(
    new UpdateTableCommand({
      TableName: tableName,
      DeletionProtectionEnabled: !allowDeletion
    })
  );
};

export const updateTimeToLive = async (logger: Logger.OperationLogger, tableName: string, request: UpdateTimeToLiveRequest) => {
  logger.update(`Updating table TTL`);

  const { enabled, attributeName } = request;

  await client.send(
    new UpdateTimeToLiveCommand({
      TableName: tableName,
      TimeToLiveSpecification: {
        AttributeName: attributeName,
        Enabled: enabled
      }
    })
  );

  await waitForTimeToLive(client, tableName);
};

export const importIndex = async (logger: Logger.OperationLogger, tableName: string, request: AttributeSchemaGroup) => {
  const indexName = getSecondaryIndexName(request);

  logger.update(`Importing global index ${indexName}`);

  try {
    const response = await client.send(
      new DescribeTableCommand({
        TableName: tableName
      })
    );

    return response.Table?.GlobalSecondaryIndexes?.some((index) => {
      return index.IndexName === indexName;
    });
  } catch (error) {
    if (!(error instanceof ResourceNotFoundException)) {
      throw error;
    }

    return false;
  }
};

export const createIndex = async (logger: Logger.OperationLogger, tableName: string, request: AttributeSchemaGroup) => {
  const [globalIndex] = getSecondaryIndexes(request);

  const indexName = globalIndex.IndexName!;

  logger.update(`Creating global index ${indexName}`);

  await client.send(
    new UpdateTableCommand({
      TableName: tableName,
      AttributeDefinitions: getAttributeDefinitions(request),
      GlobalSecondaryIndexUpdates: [
        {
          Create: globalIndex
        }
      ]
    })
  );

  await waitForSecondaryIndex(client, tableName, indexName);
};

export const deleteIndex = async (logger: Logger.OperationLogger, tableName: string, request: AttributeSchemaGroup) => {
  const indexName = getSecondaryIndexName(request);

  logger.update(`Deleting global index ${indexName}`);

  try {
    await client.send(
      new UpdateTableCommand({
        TableName: tableName,
        GlobalSecondaryIndexUpdates: [
          {
            Delete: {
              IndexName: indexName
            }
          }
        ]
      })
    );

    await waitForSecondaryIndex(client, tableName, indexName);

    return true;
  } catch (error) {
    if (!(error instanceof ResourceNotFoundException)) {
      throw error;
    }

    return false;
  }
};

export const tagTable = async (logger: Logger.OperationLogger, tableArn: string, tags: ResourceTags) => {
  logger.update(`Tag table`);

  await client.send(
    new TagResourceCommand({
      ResourceArn: tableArn,
      Tags: getTagList({
        ...tags,
        ManagedBy: 'EZ4'
      })
    })
  );
};

export const untagTable = async (logger: Logger.OperationLogger, tableArn: Arn, tagKeys: string[]) => {
  logger.update(`Untag table`);

  await client.send(
    new UntagResourceCommand({
      ResourceArn: tableArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteTable = async (logger: Logger.OperationLogger, tableName: string) => {
  logger.update(`Deleting table`);

  // If the table is still in use due to a prior change that's not
  // done yet, keep retrying until max attempts.
  await waitDeletion(async () => {
    try {
      await client.send(
        new DeleteTableCommand({
          TableName: tableName
        })
      );
    } catch (error) {
      if (!(error instanceof ResourceNotFoundException)) {
        throw error;
      }
    }
  });

  await waitUntilTableNotExists(waiter, {
    TableName: tableName
  });
};
