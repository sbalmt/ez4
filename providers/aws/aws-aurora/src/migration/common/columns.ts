import type { AnySchema, NumberSchema, StringSchema } from '@ez4/schema';
import type { PgIndexRepository } from '@ez4/pgclient/library';

import { SchemaType, isScalarSchema, isStringSchema, isObjectSchema, isArraySchema, isTupleSchema, isEnumSchema } from '@ez4/schema';

import { isAnyNumber } from '@ez4/utils';
import { Index } from '@ez4/database';

export type ColumnSchema = Record<string, AnySchema>;

export const prepareCreateColumns = (table: string, indexes: PgIndexRepository, columns: ColumnSchema) => {
  const allStatements = [];

  for (const columnName in columns) {
    const columnSchema = columns[columnName];

    const columnIndexType = indexes[columnName]?.type;
    const columnIsPrimary = columnIndexType === Index.Primary;

    const columnType = getColumnType(columnSchema, columnIsPrimary);

    const statement = [`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${columnName}" ${columnType}`];

    if (!isOptionalColumn(columnSchema)) {
      statement.push(`NOT null`);
    }

    const columnDefault = getColumnDefault(columnSchema, columnIsPrimary);

    if (columnDefault) {
      statement.push(`DEFAULT ${columnDefault}`);
    }

    allStatements.push(statement.join(' '));
  }

  return allStatements;
};

export const prepareUpdateColumns = (table: string, indexes: PgIndexRepository, columns: ColumnSchema) => {
  const allStatements = [];

  for (const columnName in columns) {
    const statement = `ALTER TABLE "${table}" ALTER COLUMN "${columnName}"`;

    const columnSchema = columns[columnName];

    const columnIndexType = indexes[columnName]?.type;
    const columnIsPrimary = columnIndexType === Index.Primary;

    const columnType = getColumnType(columnSchema, columnIsPrimary);

    allStatements.push(`${statement} TYPE ${columnType} USING "${columnName}"::${columnType}`);

    const columnNullable = isOptionalColumn(columnSchema);

    if (columnNullable) {
      allStatements.push(`${statement} DROP NOT null`);
    } else {
      allStatements.push(`${statement} SET NOT null`);
    }

    const columnDefault = getColumnDefault(columnSchema, columnIsPrimary);

    if (columnDefault) {
      allStatements.push(`${statement} SET DEFAULT ${columnDefault}`);
    } else {
      allStatements.push(`${statement} DROP DEFAULT`);
    }
  }

  return allStatements;
};

export const prepareDeleteColumns = (table: string, columns: ColumnSchema) => {
  const statements = [];

  for (const columnName in columns) {
    statements.push(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "${columnName}"`);
  }

  return statements;
};

export const prepareRenameColumns = (table: string, columns: Record<string, string>) => {
  const statements = [];

  for (const fromColumn in columns) {
    const toColum = columns[fromColumn];

    statements.push(`ALTER TABLE "${table}" RENAME COLUMN "${fromColumn}" TO "${toColum}"`);
  }

  return statements;
};

export const isOptionalColumn = (schema: AnySchema) => {
  return !!(schema.nullable || schema.optional);
};

export const getColumnDefault = (schema: AnySchema, primaryIndex: boolean) => {
  if (isScalarSchema(schema) || isObjectSchema(schema) || isArraySchema(schema) || isTupleSchema(schema) || isEnumSchema(schema)) {
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
