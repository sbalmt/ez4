import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { DatabaseService } from '@ez4/database/library';
import type { ServeOptions } from '@ez4/project/library';
import type { AttributeSchemaGroup } from '../types/schema';

import { getServiceName } from '@ez4/project/library';

import {
  CreateTableCommand,
  DeleteTableCommand,
  ResourceNotFoundException,
  ResourceInUseException,
  BillingMode
} from '@aws-sdk/client-dynamodb';

import { getSecondaryIndexes } from '../table/helpers/indexes';
import { getAttributeDefinitions, getAttributeKeyTypes } from '../table/helpers/schema';
import { getAttributeSchema } from '../utils/schema';
import { getTableName } from '../utils/table';

export const createAllTables = async (client: DynamoDBDocumentClient, service: DatabaseService, options: ServeOptions) => {
  const tablePrefix = getServiceName(service, options);

  for (const table of service.tables) {
    const { attributeSchema } = getAttributeSchema(table.indexes, table.schema);

    const tableName = getTableName(tablePrefix, table);

    await createTable(client, tableName, attributeSchema);
  }
};

export const deleteAllTables = async (client: DynamoDBDocumentClient, service: DatabaseService, options: ServeOptions) => {
  const tablePrefix = getServiceName(service, options);

  for (const table of service.tables) {
    const tableName = getTableName(tablePrefix, table);

    await deleteTable(client, tableName);
  }
};

const createTable = async (client: DynamoDBDocumentClient, tableName: string, attributeSchema: AttributeSchemaGroup[]) => {
  const [primarySchema, ...secondarySchema] = attributeSchema;

  try {
    await client.send(
      new CreateTableCommand({
        TableName: tableName,
        AttributeDefinitions: getAttributeDefinitions([...(secondarySchema ?? []).flat(), ...primarySchema]),
        KeySchema: getAttributeKeyTypes(primarySchema),
        BillingMode: BillingMode.PAY_PER_REQUEST,
        ...(secondarySchema?.length && {
          GlobalSecondaryIndexes: getSecondaryIndexes(...secondarySchema)
        })
      })
    );
  } catch (error) {
    if (!(error instanceof ResourceInUseException)) {
      throw error;
    }
  }
};

const deleteTable = async (client: DynamoDBDocumentClient, tableName: string) => {
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
};
