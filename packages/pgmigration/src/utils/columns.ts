import type { AnySchema, NumberSchema, StringSchema } from '@ez4/schema';

import { isArraySchema, isEnumSchema, isObjectSchema, isScalarSchema, isStringSchema, isTupleSchema, SchemaType } from '@ez4/schema';
import { isAnyNumber } from '@ez4/utils';

export const isOptionalColumn = (schema: AnySchema) => {
  return !!(schema.nullable || schema.optional);
};

export const getColumnDefault = (schema: AnySchema, primaryIndex: boolean) => {
  if (isScalarSchema(schema) || isObjectSchema(schema) || isArraySchema(schema) || isTupleSchema(schema)) {
    const { definitions } = schema;

    switch (typeof definitions?.default) {
      case 'boolean':
      case 'number':
        return `${definitions.default}`;

      case 'string':
        return `'${definitions.default}'`;

      case 'object':
        return `'${JSON.stringify(definitions.default)}'`;
    }
  }

  if (isEnumSchema(schema)) {
    const { definitions } = schema;

    if (definitions?.default) {
      return `'${definitions.default}'`;
    }
  }

  if (isStringSchema(schema) && primaryIndex) {
    switch (schema.format) {
      case 'date-time':
      case 'date':
      case 'time':
        return 'now()';

      case 'uuid':
        return 'gen_random_uuid()';
    }
  }

  if (isOptionalColumn(schema)) {
    return 'null';
  }

  return undefined;
};

export const getColumnType = (schema: AnySchema, primaryIndex: boolean) => {
  switch (schema.type) {
    case SchemaType.Array:
    case SchemaType.Object:
    case SchemaType.Reference:
    case SchemaType.Union:
    case SchemaType.Tuple:
      return 'jsonb';

    case SchemaType.Boolean:
      return 'boolean';

    case SchemaType.Enum:
      return 'text';

    case SchemaType.Number:
      return getColumNumberType(schema, primaryIndex);

    case SchemaType.String:
      return getColumnTextType(schema);
  }
};

const getColumNumberType = (schema: NumberSchema, primaryIndex: boolean) => {
  if (schema.format === 'integer') {
    return primaryIndex ? 'bigserial' : 'bigint';
  }

  return 'decimal';
};

const getColumnTextType = (schema: StringSchema) => {
  switch (schema.format) {
    case 'uuid':
    case 'time':
    case 'date':
      return schema.format;

    case 'date-time':
      return 'timestamptz';

    default:
      const maxLength = schema.definitions?.maxLength;

      if (isAnyNumber(maxLength)) {
        return `varchar(${maxLength})`;
      }

      return 'text';
  }
};
