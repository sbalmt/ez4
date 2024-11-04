import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { AttributeSchema, AttributeSchemaGroup } from '../types/schema.js';

import { getTagList, Logger } from '@ez4/aws-common';

import {
  BillingMode,
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
  StreamViewType,
  TagResourceCommand,
  UntagResourceCommand,
  UpdateTableCommand,
  UpdateTimeToLiveCommand,
  waitUntilTableExists,
  waitUntilTableNotExists
} from '@aws-sdk/client-dynamodb';

import { getAttributeDefinitions, getAttributeKeyTypes } from './helpers/schema.js';
import { getSecondaryIndexes, waitForSecondaryIndex } from './helpers/indexes.js';
import { waitForTimeToLive } from './helpers/ttl.js';
import { TableServiceName } from './types.js';

const client = new DynamoDBClient({});

const defaultRWU = 25;

const waiter = {
  minDelay: 15,
  maxWaitTime: 1800,
  maxDelay: 60,
  client
};

export type CapacityUnits = {
  maxReadUnits: number;
  maxWriteUnits: number;
};

export type CreateRequest = {
  tableName: string;
  primarySchema: AttributeSchema[];
  secondarySchema?: AttributeSchemaGroup[];
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

  const { primarySchema, secondarySchema, capacityUnits, enableStreams } = request;

  const maxWU = capacityUnits?.maxWriteUnits ?? defaultRWU;
  const maxRU = capacityUnits?.maxReadUnits ?? defaultRWU;

  const response = await client.send(
    new CreateTableCommand({
      TableName: request.tableName,
      DeletionProtectionEnabled: !request.allowDeletion,
      AttributeDefinitions: getAttributeDefinitions([
        ...(secondarySchema ?? []).flat(),
        ...primarySchema
      ]),
      KeySchema: getAttributeKeyTypes(primarySchema),
      BillingMode: BillingMode.PAY_PER_REQUEST,
      OnDemandThroughput: {
        MaxReadRequestUnits: maxRU,
        MaxWriteRequestUnits: maxWU
      },
      StreamSpecification: {
        StreamEnabled: !!enableStreams,
        ...(enableStreams && {
          StreamViewType: StreamViewType.NEW_AND_OLD_IMAGES
        })
      },
      ...(secondarySchema?.length && {
        GlobalSecondaryIndexes: getSecondaryIndexes(...secondarySchema)
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

export const createIndex = async (tableName: string, request: AttributeSchemaGroup) => {
  Logger.logCreate(TableServiceName, `${tableName} index`);

  const [Create] = getSecondaryIndexes(request);

  await client.send(
    new UpdateTableCommand({
      TableName: tableName,
      AttributeDefinitions: getAttributeDefinitions(request),
      GlobalSecondaryIndexUpdates: [{ Create }]
    })
  );

  await waitForSecondaryIndex(client, tableName, Create.IndexName!);
};

export const deleteIndex = async (tableName: string, request: AttributeSchemaGroup) => {
  Logger.logDelete(TableServiceName, `${tableName} index`);

  const [{ IndexName }] = getSecondaryIndexes(request);

  await client.send(
    new UpdateTableCommand({
      TableName: tableName,
      GlobalSecondaryIndexUpdates: [
        {
          Delete: { IndexName }
        }
      ]
    })
  );

  await waitForSecondaryIndex(client, tableName, IndexName!);
};

export const tagTable = async (tableArn: string, tags: ResourceTags) => {
  Logger.logTag(TableServiceName, tableArn);

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
  Logger.logUntag(TableServiceName, tableArn);

  await client.send(
    new UntagResourceCommand({
      ResourceArn: tableArn,
      TagKeys: tagKeys
    })
  );
};

export const deleteTable = async (tableName: string) => {
  Logger.logDelete(TableServiceName, tableName);

  await client.send(
    new DeleteTableCommand({
      TableName: tableName
    })
  );

  await waitUntilTableNotExists(waiter, {
    TableName: tableName
  });
};
