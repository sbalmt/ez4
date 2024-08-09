import type { DatabaseService, DatabaseTable } from '@ez4/database/library';
import type { ServiceResourceEvent } from '@ez4/project';
import type { AttributeSchema } from '../types/schema.js';

import { isDatabaseService } from '@ez4/database/library';
import { ExtraSchema, ObjectSchema, SchemaTypeName } from '@ez4/schema';
import { toKebabCase } from '@ez4/utils';

import { AttributeType, AttributeKeyType } from '../types/schema.js';
import { createTable } from '../table/service.js';

export const prepareDatabaseServices = async (event: ServiceResourceEvent) => {
  const { state, service, options } = event;

  if (!isDatabaseService(service)) {
    return;
  }

  for (const table of service.tables) {
    const tableName = getTableName(service, table, options.resourcePrefix);

    createTable(state, {
      attributeSchema: getAttributeSchema(table.schema),
      tableName
    });
  }
};

const getTableName = (service: DatabaseService, table: DatabaseTable, resourcePrefix: string) => {
  const databaseName = toKebabCase(service.name);
  const tableName = toKebabCase(table.name);

  return `${resourcePrefix}-${databaseName}-${tableName}`;
};

const getAttributeKeyType = (extra: ExtraSchema) => {
  switch (extra.index) {
    case 'primary':
      return AttributeKeyType.Hash;

    case 'regular':
      return AttributeKeyType.Range;
  }

  return null;
};

const getAttributeSchema = (schema: ObjectSchema): AttributeSchema[] => {
  const attributeSchema: AttributeSchema[] = [];

  for (const attributeName in schema.properties) {
    const { type, extra } = schema.properties[attributeName];

    if (!extra?.index) {
      continue;
    }

    const keyType = getAttributeKeyType(extra);

    if (!keyType) {
      continue;
    }

    switch (type) {
      case SchemaTypeName.Number:
        attributeSchema.push({
          attributeType: AttributeType.Number,
          attributeName,
          keyType
        });
        break;

      case SchemaTypeName.Boolean:
        attributeSchema.push({
          attributeType: AttributeType.Boolean,
          attributeName,
          keyType
        });
        break;

      default:
        attributeSchema.push({
          attributeType: AttributeType.String,
          attributeName,
          keyType
        });
    }
  }

  return attributeSchema;
};
