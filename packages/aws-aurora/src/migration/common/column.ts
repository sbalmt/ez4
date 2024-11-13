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
    return 'null';
  }

  return undefined;
};

export const getColumnType = (schema: AnySchema) => {
  switch (schema.type) {
    case SchemaTypeName.Array:
    case SchemaTypeName.Object:
    case SchemaTypeName.Union:
    case SchemaTypeName.Tuple:
      return `jsonb`;

    case SchemaTypeName.Boolean:
      return `boolean`;

    case SchemaTypeName.Enum:
      return `text`;

    case SchemaTypeName.Number:
      return getColumNumberType(schema);

    case SchemaTypeName.String:
      return getColumnTextType(schema);
  }
};

const getColumNumberType = (schema: NumberSchema) => {
  if (schema.format === 'decimal') {
    return `decimal`;
  }

  if (isNullableColumn(schema)) {
    return 'bigserial';
  }

  return 'bigint';
};

const getColumnTextType = (schema: StringSchema) => {
  switch (schema.format) {
    case 'uuid':
    case 'time':
    case 'date':
      return schema.format;

    case 'date-time':
      return 'timestamp';

    default:
      const maxLength = schema.extra?.maxLength;

      if (isAnyNumber(maxLength)) {
        return `varchar(${maxLength})`;
      }

      return 'text';
  }
};
