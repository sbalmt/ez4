import type { AnySchema, NumberSchema, StringSchema } from '@ez4/schema';
import type { RepositoryIndexes } from '../../main.js';

import { isStringSchema, SchemaType } from '@ez4/schema';
import { isAnyNumber } from '@ez4/utils';
import { Index } from '@ez4/database';

export type ColumnSchema = Record<string, AnySchema>;

export const prepareCreateColumns = (
  table: string,
  indexes: RepositoryIndexes,
  columns: ColumnSchema
) => {
  const alterTable = `"${table}"`;
  const statements = [];

  for (const columnName in columns) {
    const columnSchema = columns[columnName];

    const indexType = indexes[columnName]?.type;
    const isPrimary = indexType === Index.Primary;

    const columnType = getColumnType(columnSchema, isPrimary);

    statements.push(`ALTER TABLE ${alterTable} ADD COLUMN "${columnName}" ${columnType}`);
  }

  return statements;
};

export const prepareUpdateColumns = (
  table: string,
  indexes: RepositoryIndexes,
  columns: ColumnSchema
) => {
  const statements = [];

  for (const columnName in columns) {
    const alterColumn = `ALTER TABLE "${table}" ALTER COLUMN "${columnName}"`;

    const columnSchema = columns[columnName];

    const indexType = indexes[columnName]?.type;
    const isPrimary = indexType === Index.Primary;

    const columnType = getColumnType(columnSchema, isPrimary);

    statements.push(`${alterColumn} TYPE ${columnType}`);

    const columnNullable = isOptionalColumn(columnSchema);

    if (columnNullable) {
      statements.push(`${alterColumn} DROP NOT NULL`);
    } else {
      statements.push(`${alterColumn} SET NOT NULL`);
    }

    const columnDefault = isPrimary && getColumnDefault(columnSchema);

    if (columnDefault) {
      statements.push(`${alterColumn} SET DEFAULT ${columnDefault}`);
    } else {
      statements.push(`${alterColumn} DROP DEFAULT`);
    }
  }

  return statements;
};

export const prepareDeleteColumns = (table: string, columns: ColumnSchema) => {
  const statements = [];

  for (const columnName in columns) {
    statements.push(`ALTER TABLE "${table}" DROP COLUMN "${columnName}"`);
  }

  return statements;
};

export const isOptionalColumn = (schema: AnySchema) => {
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
      return `jsonb`;

    case SchemaType.Boolean:
      return `boolean`;

    case SchemaType.Enum:
      return `text`;

    case SchemaType.Number:
      return getColumNumberType(schema, primaryIndex);

    case SchemaType.String:
      return getColumnTextType(schema);
  }
};

const getColumNumberType = (schema: NumberSchema, primaryIndex: boolean) => {
  if (schema.format === 'decimal') {
    return `decimal`;
  }

  if (primaryIndex && isOptionalColumn(schema)) {
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
      return 'timestamptz';

    default:
      const maxLength = schema.definitions?.maxLength;

      if (isAnyNumber(maxLength)) {
        return `varchar(${maxLength})`;
      }

      return 'text';
  }
};
