import type { AnySchema, NumberSchema, StringSchema } from '@ez4/schema';
import type { RepositoryIndexes } from '../../main.js';

import { isStringSchema, SchemaType } from '@ez4/schema';
import { isAnyNumber } from '@ez4/utils';
import { Index } from '@ez4/database';

export const prepareCreateColumns = (table: string, columns: Record<string, AnySchema>) => {
  const alterTable = ``;

  const statements = [];

  for (const columnName in columns) {
    const columnSchema = columns[columnName];

    const columnType = getColumnType(columnSchema);

    statements.push(
      `ALTER TABLE "${table}" ${alterTable} ADD COLUMN "${columnName}" ${columnType}`
    );
  }

  return statements;
};

export const prepareUpdateColumns = (
  table: string,
  indexes: RepositoryIndexes,
  columns: Record<string, AnySchema>
) => {
  const statements = [];

  for (const columnName in columns) {
    const alterColumn = `ALTER TABLE "${table}" ALTER COLUMN "${columnName}"`;

    const columnSchema = columns[columnName];
    const columnType = getColumnType(columnSchema);

    statements.push(`${alterColumn} TYPE ${columnType}`);

    const columnNullable = isNullableColumn(columnSchema);

    if (columnNullable) {
      statements.push(`${alterColumn} DROP NOT NULL`);
    } else {
      statements.push(`${alterColumn} SET NOT NULL`);
    }

    const columnIndexType = indexes[columnName]?.type;
    const columnDefault = columnIndexType === Index.Primary && getColumnDefault(columnSchema);

    if (columnDefault) {
      statements.push(`${alterColumn} SET DEFAULT ${columnDefault}`);
    } else {
      statements.push(`${alterColumn} DROP DEFAULT`);
    }
  }

  return statements;
};

export const prepareDeleteColumns = (table: string, columns: Record<string, AnySchema>) => {
  const statements = [];

  for (const columnName in columns) {
    statements.push(`ALTER TABLE "${table}" DROP COLUMN "${columnName}"`);
  }

  return statements;
};

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
      const maxLength = schema.definitions?.maxLength;

      if (isAnyNumber(maxLength)) {
        return `varchar(${maxLength})`;
      }

      return 'text';
  }
};
