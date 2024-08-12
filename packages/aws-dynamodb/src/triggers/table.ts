import type { Database } from '@ez4/database';
import type { ObjectSchema } from '@ez4/schema';
import type { ServiceResourceEvent } from '@ez4/project';
import type { AttributeSchema } from '../types/schema.js';

import { Index } from '@ez4/database';
import { SchemaTypeName } from '@ez4/schema';
import { isDatabaseService } from '@ez4/database/library';
import { getFunction } from '@ez4/aws-function';
import { isRole } from '@ez4/aws-identity';

import { AttributeType, AttributeKeyType } from '../types/schema.js';
import { createFunction } from '../function/service.js';
import { createMapping } from '../mapping/service.js';
import { createTable } from '../table/service.js';
import { getTableName } from './utils.js';

export const prepareDatabaseServices = async (event: ServiceResourceEvent) => {
  const { state, service, role, options } = event;

  if (!isDatabaseService(service) || !isRole(role)) {
    return;
  }

  for (const table of service.tables) {
    const tableName = getTableName(service, table, options.resourcePrefix);
    const tableStream = table.stream;

    const tableState = createTable(state, {
      attributeSchema: getAttributeSchema(table.indexes, table.schema),
      enableStreams: !!tableStream,
      tableName
    });

    if (tableStream) {
      const streamHandler = tableStream.handler;
      const functionName = `${tableName}-${streamHandler.name}`;

      const functionState =
        getFunction(state, role, functionName) ??
        (await createFunction(state, role, {
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
        }));

      createMapping(state, tableState, functionState, {});
    }
  }
};

const getAttributeSchema = (indexes: Database.Indexes, schema: ObjectSchema): AttributeSchema[] => {
  const attributeSchema: AttributeSchema[] = [];
  const allColumns = schema.properties;

  let position = 0;

  for (const indexName in indexes) {
    const indexType = indexes[indexName as keyof Database.Indexes];

    if (indexType !== Index.Primary) {
      throw new Error(`DynamoDB only supports primary keys.`);
    }

    if (position > 1) {
      throw new Error(`DynamoDB only supports one index key.`);
    }

    for (const columnName of indexName.split(':')) {
      const columnSchema = allColumns[columnName];

      if (position > 1) {
        throw new Error(`DynamoDB only supports one compound index key.`);
      }

      if (!columnSchema) {
        throw new Error(`Unable column ${columnName}, ensure the given schema is correct.`);
      }

      switch (columnSchema.type) {
        case SchemaTypeName.Boolean:
          attributeSchema.push({
            keyType: AttributeKeyType.Hash,
            attributeType: AttributeType.Boolean,
            attributeName: columnName
          });
          break;

        case SchemaTypeName.Number:
          attributeSchema.push({
            keyType: position === 0 ? AttributeKeyType.Hash : AttributeKeyType.Range,
            attributeType: AttributeType.Number,
            attributeName: columnName
          });
          break;

        default:
          attributeSchema.push({
            keyType: AttributeKeyType.Hash,
            attributeType: AttributeType.String,
            attributeName: columnName
          });
      }

      position++;
    }
  }

  return attributeSchema;
};
