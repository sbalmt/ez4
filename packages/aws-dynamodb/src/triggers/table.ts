import type { Database } from '@ez4/database';
import type { ObjectSchema, ObjectSchemaProperties } from '@ez4/schema';
import type { PrepareResourceEvent } from '@ez4/project/library';
import type { AttributeSchema } from '../types/schema.js';

import { Index } from '@ez4/database';
import { SchemaTypeName } from '@ez4/schema';
import { isDatabaseService } from '@ez4/database/library';
import { getFunction } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createMapping } from '../mapping/service.js';
import { createStreamFunction } from '../mapping/function/service.js';
import { AttributeType, AttributeKeyType } from '../types/schema.js';
import { createTable } from '../table/service.js';
import { getStreamName, getTableName } from './utils.js';

export const prepareDatabaseServices = async (event: PrepareResourceEvent) => {
  const { state, service, role, options } = event;

  if (!isDatabaseService(service) || service.engine !== 'dynamodb') {
    return;
  }

  for (const table of service.tables) {
    const tableName = getTableName(service, table, options);
    const tableStream = table.stream;

    const { attributeSchema, ttlAttribute } = getAttributeSchema(table.indexes, table.schema);

    const tableState = createTable(state, {
      enableStreams: !!tableStream,
      attributeSchema,
      ttlAttribute,
      tableName
    });

    if (tableStream) {
      if (!role || !isRoleState(role)) {
        throw new Error(`Execution role for DynamoDB stream is missing.`);
      }

      const streamHandler = tableStream.handler;
      const functionName = getStreamName(service, table, streamHandler.name, options);

      const functionState =
        getFunction(state, role, functionName) ??
        createStreamFunction(state, role, {
          functionName,
          description: streamHandler.description,
          sourceFile: streamHandler.file,
          handlerName: streamHandler.name,
          timeout: tableStream.timeout,
          memory: tableStream.memory,
          tableSchema: table.schema,
          extras: service.extras,
          variables: {
            ...service.variables,
            ...tableStream.variables
          }
        });

      createMapping(state, tableState, functionState, {});
    }
  }
};

const getAttributeSchema = (indexes: Database.Indexes, schema: ObjectSchema) => {
  const attributeSchema: AttributeSchema[] = [];

  let ttlAttribute: string | undefined;

  for (const indexName in indexes) {
    const indexType = indexes[indexName as keyof Database.Indexes];

    switch (indexType) {
      case Index.TTL:
        ttlAttribute = getTimeToLiveIndex(indexName, schema.properties);
        break;

      case Index.Primary:
        attributeSchema.push(...getAttributeIndex(indexName, schema.properties));
        break;

      default:
        throw new Error(`DynamoDB index type ${indexType} isn't supported.`);
    }
  }

  if (attributeSchema.length === 0) {
    throw new Error(`DynamoDB needs at least one partition key.`);
  }

  if (attributeSchema.length > 2) {
    throw new Error(`DynamoDB only supports one partition key.`);
  }

  return {
    attributeSchema,
    ttlAttribute
  };
};

const getTimeToLiveIndex = (indexName: string, allColumns: ObjectSchemaProperties) => {
  const columnSchema = allColumns[indexName];

  if (!columnSchema) {
    throw new Error(`DynamoDB TTL index ${indexName} doesn't exists or it's a compound index.`);
  }

  if (columnSchema.type !== SchemaTypeName.Number) {
    throw new Error(`DynamoDB TTL index ${indexName} must be a number.`);
  }

  return indexName;
};

const getAttributeIndex = (indexName: string, allColumns: ObjectSchemaProperties) => {
  const attributeSchema: AttributeSchema[] = [];

  const schemaAttributeTypesMap: Record<string, AttributeType | undefined> = {
    [SchemaTypeName.Boolean]: AttributeType.Boolean,
    [SchemaTypeName.Number]: AttributeType.Number,
    [SchemaTypeName.String]: AttributeType.String
  };

  for (const columnName of indexName.split(':')) {
    const columnSchema = allColumns[columnName];

    if (!columnSchema) {
      throw new Error(`Column ${columnName} doesn't exists, ensure the given schema is correct.`);
    }

    attributeSchema.push({
      attributeName: columnName,
      attributeType: schemaAttributeTypesMap[columnSchema.type] ?? AttributeType.String,
      keyType: attributeSchema.length === 0 ? AttributeKeyType.Hash : AttributeKeyType.Range
    });
  }

  return attributeSchema;
};
