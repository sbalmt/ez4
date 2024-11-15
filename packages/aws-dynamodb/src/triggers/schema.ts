import type { ObjectSchema, ObjectSchemaProperties } from '@ez4/schema';
import type { TableIndex } from '@ez4/database/library';
import type { AttributeSchema, AttributeSchemaGroup } from '../types/schema.js';

import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { AttributeType, AttributeKeyType } from '../types/schema.js';

const SchemaTypesMap: Record<string, AttributeType | undefined> = {
  [SchemaType.Number]: AttributeType.Number,
  [SchemaType.String]: AttributeType.String,
  [SchemaType.Enum]: AttributeType.String
};

export const getAttributeSchema = (indexes: TableIndex[], schema: ObjectSchema) => {
  const primarySchema: AttributeSchema[] = [];
  const secondarySchema: AttributeSchemaGroup[] = [];

  let ttlAttribute: string | undefined;

  for (const { name, type } of indexes) {
    switch (type) {
      case Index.TTL:
        ttlAttribute = getTimeToLiveIndex(name, schema.properties);
        break;

      case Index.Primary:
        primarySchema.push(...getAttributeIndex(name, schema.properties));
        break;

      case Index.Secondary:
        secondarySchema.push(getAttributeIndex(name, schema.properties));
        break;

      default:
        throw new Error(`DynamoDB index type '${type}' isn't supported.`);
    }
  }

  if (primarySchema.length === 0) {
    throw new Error(`DynamoDB needs at least one partition key.`);
  }

  return {
    attributeSchema: [primarySchema, ...secondarySchema],
    ttlAttribute
  };
};

const getTimeToLiveIndex = (indexName: string, allColumns: ObjectSchemaProperties) => {
  const columnSchema = allColumns[indexName];

  if (!columnSchema) {
    throw new Error(`DynamoDB TTL index ${indexName} doesn't exists or it's a compound index.`);
  }

  if (columnSchema.type !== SchemaType.Number) {
    throw new Error(`DynamoDB TTL index ${indexName} must be a number.`);
  }

  return indexName;
};

const getAttributeIndex = (indexName: string, allColumns: ObjectSchemaProperties) => {
  const attributeSchema: AttributeSchema[] = [];

  for (const columnName of indexName.split(':')) {
    const columnSchema = allColumns[columnName];

    if (!columnSchema) {
      throw new Error(`Column ${columnName} doesn't exists, ensure the given schema is correct.`);
    }

    const attributeType = SchemaTypesMap[columnSchema.type];

    if (!attributeType) {
      throw new Error(`Index column ${columnName} must be a string or a number.`);
    }

    const keyType = attributeSchema.length === 0 ? AttributeKeyType.Hash : AttributeKeyType.Range;

    attributeSchema.push({
      attributeName: columnName,
      attributeType,
      keyType
    });
  }

  if (attributeSchema.length > 2) {
    throw new Error(`DynamoDB compound index ${indexName} must have at most 2 columns.`);
  }

  return attributeSchema;
};
