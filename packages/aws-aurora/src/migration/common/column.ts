import type { AnySchema, NumberSchema, StringSchema } from '@ez4/schema';

import { isStringSchema, SchemaTypeName } from '@ez4/schema';
import { isAnyNumber } from '@ez4/utils';

export const isNullableColumn = (schema: AnySchema) => {
  return !!(schema.nullable || schema.optional);
};

export const getColumnDefault = (schema: AnySchema) => {
  if (isStringSchema(schema)) {
    switch (schema.format) {
      case 'uuid':
        return 'gen_random_uuid()';

      case 'time':
      case 'date':
      case 'date-time':
        return 'now()';
    }
  }

  if (isNullableColumn(schema)) {
    return 'NULL';
  }

  return undefined;
};

export const getColumnType = (schema: AnySchema) => {
  switch (schema.type) {
    case SchemaTypeName.Array:
    case SchemaTypeName.Object:
    case SchemaTypeName.Union:
    case SchemaTypeName.Tuple:
      return `JSONB`;

    case SchemaTypeName.Boolean:
      return `BOOLEAN`;

    case SchemaTypeName.Enum:
      return `TEXT`;

    case SchemaTypeName.Number:
      return getColumNumberType(schema);

    case SchemaTypeName.String:
      return getColumnTextType(schema);
  }
};

const getColumNumberType = (schema: NumberSchema) => {
  if (schema.format === 'decimal') {
    return `DECIMAL`;
  }

  if (isNullableColumn(schema)) {
    return 'BIGSERIAL';
  }

  return 'BIGINT';
};

const getColumnTextType = (schema: StringSchema) => {
  switch (schema.format) {
    case 'uuid':
      return 'UUID';

    case 'time':
      return 'TIME';

    case 'date':
      return 'DATE';

    case 'date-time':
      return 'TIMESTAMP';

    default:
      const maxLength = schema.extra?.maxLength;

      if (isAnyNumber(maxLength)) {
        return `VARCHAR(${maxLength})`;
      }

      return 'TEXT';
  }
};
