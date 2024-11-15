import type { AnySchema, NumberSchema, StringSchema } from '@ez4/schema';

import { isStringSchema, SchemaType } from '@ez4/schema';
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
    case SchemaType.Array:
    case SchemaType.Object:
    case SchemaType.Union:
    case SchemaType.Tuple:
      return `jsonb`;

    case SchemaType.Boolean:
      return `boolean`;

    case SchemaType.Enum:
      return `text`;

    case SchemaType.Number:
      return getColumNumberType(schema);

    case SchemaType.String:
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
