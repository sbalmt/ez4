import type { Arn, ResourceTags } from '@ez4/aws-common';
import type { SchemaDefinition } from '../types/schema.js';

import { getTagList, Logger } from '@ez4/aws-common';

import {
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
  TagResourceCommand,
  UntagResourceCommand,
  UpdateTableCommand,
  waitUntilTableExists,
  waitUntilTableNotExists
} from '@aws-sdk/client-dynamodb';

import { TableServiceName } from './types.js';
import { getAttributeTypes, getKeySchema } from './helpers/schema.js';

const client = new DynamoDBClient({});

const waiter = {
  maxWaitTime: 30,
  client
};

export type CapacityUnits = {
  readCapacity: number;
  writeCapacity: number;
};

export type CreateRequest = {
  tableName: string;
  capacityUnits: CapacityUnits;
  schemaDefinitions: SchemaDefinition[];
  allowDeletion?: boolean;
  tags?: ResourceTags;
};

export type CreateResponse = {
  tableName: string;
  tableArn: Arn;
};

export type UpdateRequest = Partial<Omit<CreateRequest, 'tableName' | 'tags'>>;

export const createTable = async (request: CreateRequest): Promise<CreateResponse> => {
  Logger.logCreate(TableServiceName, request.tableName);

  const { capacityUnits } = request;

  const response = await client.send(
    new CreateTableCommand({
      TableName: request.tableName,
      DeletionProtectionEnabled: !request.allowDeletion,
      AttributeDefinitions: getAttributeTypes(request.schemaDefinitions),
      KeySchema: getKeySchema(request.schemaDefinitions),
      ProvisionedThroughput: {
        ReadCapacityUnits: capacityUnits.readCapacity,
        WriteCapacityUnits: capacityUnits.writeCapacity
      },
      Tags: getTagList({
        ...request.tags,
        ManagedBy: 'EZ4'
      })
    })
  );

  const { TableDescription } = response;

  const tableName = TableDescription!.TableName!;
  const tableArn = TableDescription!.TableArn as Arn;

  await waitUntilTableExists(waiter, {
    TableName: tableName
  });

  return {
    tableName,
    tableArn
  };
};

export const updateTable = async (tableName: string, request: UpdateRequest) => {
  Logger.logUpdate(TableServiceName, tableName);

  const { capacityUnits } = request;

  await client.send(
    new UpdateTableCommand({
      TableName: tableName,
      DeletionProtectionEnabled: !request.allowDeletion,
      ...(request.schemaDefinitions && {
        AttributeDefinitions: getAttributeTypes(request.schemaDefinitions),
        KeySchema: getKeySchema(request.schemaDefinitions)
      }),
      ...(capacityUnits && {
        ProvisionedThroughput: {
          ReadCapacityUnits: capacityUnits.readCapacity,
          WriteCapacityUnits: capacityUnits.writeCapacity
        }
      })
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
