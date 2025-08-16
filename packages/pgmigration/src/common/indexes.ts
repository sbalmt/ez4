import type { PgIndexRepository } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';
import type { SqlBuilder } from '@ez4/pgsql';

import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { getPrimaryKeyName, getSecondaryKeyName, getUniqueKeyName } from '../utils/names.js';

export const prepareCreateIndexes = (
  builder: SqlBuilder,
  table: string,
  schema: ObjectSchema,
  indexes: PgIndexRepository,
  concurrent: boolean
) => {
  const statements = [];

  for (const indexName in indexes) {
    if (!indexes[indexName]) {
      continue;
    }

    const { columns, type } = indexes[indexName];

    const statement = prepareCreateIndex(builder, table, schema, indexName, type, columns, concurrent);

    statements.push(statement.build());
  }

  return statements;
};

export const prepareDeleteIndexes = (builder: SqlBuilder, table: string, indexes: PgIndexRepository) => {
  const statements = [];

  for (const indexName in indexes) {
    if (!indexes[indexName]) {
      continue;
    }

    const { type } = indexes[indexName];

    const statement = prepareDeleteIndex(builder, table, indexName, type);

    statements.push(statement.build());
  }

  return statements;
};

const prepareCreateIndex = (
  builder: SqlBuilder,
  table: string,
  schema: ObjectSchema,
  name: string,
  type: Index,
  columns: string[],
  concurrent: boolean
) => {
  switch (type) {
    default:
      throw new Error(`Unsupported index type.`);

    case Index.Primary:
      return builder.table(table).alter().constraint(getPrimaryKeyName(table, name)).primary(columns);

    case Index.Unique:
      return builder.table(table).alter().constraint(getUniqueKeyName(table, name)).unique(columns);

    case Index.Secondary: {
      const statement = builder
        .index(getSecondaryKeyName(table, name))
        .create(table, columns)
        .type(getIndexType(columns, schema))
        .missing();

      if (concurrent) {
        statement.concurrent();
      }

      return statement;
    }
  }
};

const prepareDeleteIndex = (builder: SqlBuilder, table: string, name: string, type: Index) => {
  switch (type) {
    case Index.Primary:
      return builder.table(table).alter().constraint(getPrimaryKeyName(table, name)).drop().existing();

    case Index.Unique:
      return builder.table(table).alter().constraint(getUniqueKeyName(table, name)).drop().existing();

    case Index.Secondary:
      return builder.index(getSecondaryKeyName(table, name)).drop().existing().concurrent();

    default:
      throw new Error(`Unsupported index type.`);
  }
};

const getIndexType = (columns: string[], schema: ObjectSchema) => {
  if (columns.length === 1) {
    const [firstColumn] = columns;

    const columnSchema = schema.properties[firstColumn];

    switch (columnSchema?.type) {
      case SchemaType.Object:
      case SchemaType.Union:
      case SchemaType.Array:
      case SchemaType.Tuple:
        return 'GIN';
    }
  }

  return 'BTREE';
};
