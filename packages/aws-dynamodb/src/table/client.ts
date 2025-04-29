import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { AttributeSchemaGroup } from '../types/schema.js';

import { getTagList, Logger, tryParseArn, waitDeletion } from '@ez4/aws-common';

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

import { getAttributeDefinitions, getAttributeKeyTypes } from './helpers/schema.js';
import { getSecondaryIndexes, getSecondaryIndexName, waitForSecondaryIndex } from './helpers/indexes.js';
import { waitForTimeToLive } from './helpers/ttl.js';
import { TableServiceName } from './types.js';

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

export const createTable = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(TableServiceName, request.tableName);

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

  Logger.logWait(TableServiceName, tableName);

  await waitUntilTableExists(waiter, {
    TableName: tableName
  });

  return {
    tableName,
    streamArn: tableDescription.LatestStreamArn as Arn,
    tableArn: tableDescription.TableArn as Arn
  };
};

export const updateTimeToLive = async (tableName: string, request: UpdateTimeToLiveRequest) => {
  Logger.logUpdate(TableServiceName, tableName);

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

export const updateDeletion = async (tableName: string, allowDeletion: boolean) => {
  Logger.logUpdate(TableServiceName, tableName);

  await client.send(
    new UpdateTableCommand({
      TableName: tableName,
      DeletionProtectionEnabled: !allowDeletion
    })
  );
};

export const updateStreams = async (tableName: string, enableStreams: boolean) => {
  Logger.logUpdate(TableServiceName, tableName);

  await client.send(
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
};

export const importIndex = async (tableName: string, request: AttributeSchemaGroup) => {
  const indexName = getSecondaryIndexName(request);

  Logger.logImport(TableServiceName, `${tableName} global index ${indexName}`);

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

export const createIndex = async (tableName: string, request: AttributeSchemaGroup) => {
  const [globalIndex] = getSecondaryIndexes(request);

  const indexName = globalIndex.IndexName!;

  Logger.logCreate(TableServiceName, `${tableName} global index ${indexName}`);

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

  Logger.logWait(TableServiceName, `${tableName} global index ${indexName}`);

  await waitForSecondaryIndex(client, tableName, indexName);
};

export const deleteIndex = async (tableName: string, request: AttributeSchemaGroup) => {
  const [globalIndex] = getSecondaryIndexes(request);

  const indexName = globalIndex.IndexName!;

  Logger.logDelete(TableServiceName, `${tableName} global index ${indexName}`);

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

    Logger.logWait(TableServiceName, `${tableName} index ${indexName}`);

    await waitForSecondaryIndex(client, tableName, indexName);

    return true;
  } catch (error) {
    if (!(error instanceof ResourceNotFoundException)) {
      throw error;
    }

    return false;
  }
};

export const tagTable = async (tableArn: string, tags: ResourceTags) => {
  const tableName = tryParseArn(tableArn)?.resourceName ?? tableArn;

  Logger.logTag(TableServiceName, tableName);

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

export const untagTable = async (tableArn: Arn, tagKeys: string[]) => {
  const tableName = tryParseArn(tableArn)?.resourceName ?? tableArn;

  Logger.logUntag(TableServiceName, tableName);

  await client.send(
    new UntagResourceCommand({
      ResourceArn: tableArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteTable = async (tableName: string) => {
  Logger.logDelete(TableServiceName, tableName);

  // If the table is still in use due to a prior change that's not
  // done yet, keep retrying until max attempts.
  const isDeletionScheduled = await waitDeletion(async () => {
    try {
      await client.send(
        new DeleteTableCommand({
          TableName: tableName
        })
      );

      return true;
    } catch (error) {
      if (!(error instanceof ResourceNotFoundException)) {
        throw error;
      }

      return false;
    }
  });

  if (isDeletionScheduled) {
    Logger.logWait(TableServiceName, tableName);

    await waitUntilTableNotExists(waiter, {
      TableName: tableName
    });
  }
};
