import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { AttributeSchema } from '../types/schema.js';

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

import { getAttributeTypes, getAttributeKeyTypes } from './helpers/schema.js';
import { waitForTimeToLive } from './helpers/waiters.js';
import { TableServiceName } from './types.js';

const client = new DynamoDBClient({});

const defaultRWU = 25;

const waiter = {
  maxWaitTime: 90,
  client
};

export type CapacityUnits = {
  maxReadUnits: number;
  maxWriteUnits: number;
};

export type CreateRequest = {
  tableName: string;
  attributeSchema: AttributeSchema[];
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

export type UpdateRequest = Partial<
  Omit<CreateRequest, 'tableName' | 'allowDeletion' | 'enableStreams' | 'tags'>
>;

export type UpdateTimeToLiveRequest = {
  enabled: boolean;
  attributeName: string;
};

export const createTable = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(TableServiceName, request.tableName);

  const { attributeSchema, capacityUnits, enableStreams } = request;

  const maxRU = capacityUnits?.maxReadUnits ?? defaultRWU;
  const maxWU = capacityUnits?.maxWriteUnits ?? defaultRWU;

  const response = await client.send(
    new CreateTableCommand({
      TableName: request.tableName,
      DeletionProtectionEnabled: !request.allowDeletion,
      AttributeDefinitions: getAttributeTypes(attributeSchema),
      KeySchema: getAttributeKeyTypes(attributeSchema),
      BillingMode: BillingMode.PAY_PER_REQUEST,
      OnDemandThroughput: {
        MaxReadRequestUnits: maxRU,
        MaxWriteRequestUnits: maxWU
      },
      StreamSpecification: {
        ...(enableStreams && { StreamViewType: StreamViewType.NEW_AND_OLD_IMAGES }),
        StreamEnabled: !!enableStreams
      },
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  const { TableDescription } = response;

  const tableName = TableDescription!.TableName!;
  const streamArn = TableDescription!.LatestStreamArn as Arn;
  const tableArn = TableDescription!.TableArn as Arn;

  await waitUntilTableExists(waiter, {
    TableName: tableName
  });

  return {
    tableName,
    streamArn,
    tableArn
  };
};

export const updateTable = async (tableName: string, request: UpdateRequest) => {
  Logger.logUpdate(TableServiceName, tableName);

  const { attributeSchema, capacityUnits } = request;

  const maxRU = capacityUnits?.maxReadUnits ?? defaultRWU;
  const maxWU = capacityUnits?.maxWriteUnits ?? defaultRWU;

  const response = await client.send(
    new UpdateTableCommand({
      TableName: tableName,
      BillingMode: BillingMode.PAY_PER_REQUEST,
      OnDemandThroughput: {
        MaxReadRequestUnits: maxRU,
        MaxWriteRequestUnits: maxWU
      },
      ...(attributeSchema && {
        AttributeDefinitions: getAttributeTypes(attributeSchema),
        KeySchema: getAttributeKeyTypes(attributeSchema)
      })
    })
  );

  const { TableDescription } = response;

  const streamArn = TableDescription!.LatestStreamArn as Arn;
  const tableArn = TableDescription!.TableArn as Arn;

  return {
    tableName,
    streamArn,
    tableArn
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

  await waitForTimeToLive(tableName);
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
        ...(enableStreams && { StreamViewType: StreamViewType.NEW_AND_OLD_IMAGES }),
        StreamEnabled: !!enableStreams
      }
    })
  );
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
