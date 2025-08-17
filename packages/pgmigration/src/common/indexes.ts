import type { PgIndexRepository } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';
import type { SqlBuilder } from '@ez4/pgsql';

import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { getPrimaryKeyName, getSecondaryKeyName, getUniqueKeyName } from '../utils/naming.js';

export const prepareCreateIndexes = (
  builder: SqlBuilder,
  table: string,
  schema: ObjectSchema,
  indexes: PgIndexRepository,
  concurrent: boolean
) => {
  const statements = [];

  for (const indexName in indexes) {
    const { columns, type } = indexes[indexName];

    switch (type) {
      default:
        throw new Error(`Unsupported index type.`);

      case Index.Primary: {
        const name = getPrimaryKeyName(table, indexName);

        const statement = builder.table(table).alter().constraint(name).primary(columns);

        statements.push(statement.build());
        break;
      }

      case Index.Unique: {
        const name = getUniqueKeyName(table, indexName);

        const statement = builder.table(table).alter().constraint(name).unique(columns);

        statements.push(statement.build());
        break;
      }

      case Index.Secondary: {
        const name = getSecondaryKeyName(table, indexName);
        const type = getIndexType(columns, schema);

        const statement = builder.index(name).create(table, columns).type(type).missing();

        if (concurrent) {
          statement.concurrent();
        }

        statements.push(statement.build());
        break;
      }
    }
  }

  return statements;
};

export const prepareRenameIndexes = (builder: SqlBuilder, fromTable: string, toTable: string, indexes: PgIndexRepository) => {
  const statements: string[] = [];

  for (const indexName in indexes) {
    const { type } = indexes[indexName];

    switch (type) {
      default:
        throw new Error(`Unsupported index type.`);

      case Index.Primary: {
        const fromName = getPrimaryKeyName(fromTable, indexName);
        const toName = getPrimaryKeyName(toTable, indexName);

        const statement = builder.table(toTable).alter().constraint(fromName).rename(toName);

        statements.push(statement.build());
        break;
      }

      case Index.Unique: {
        const fromName = getUniqueKeyName(fromTable, indexName);
        const toName = getUniqueKeyName(toTable, indexName);

        const statement = builder.table(toTable).alter().constraint(fromName).rename(toName);

        statements.push(statement.build());
        break;
      }

      case Index.Secondary: {
        const fromName = getSecondaryKeyName(fromTable, indexName);
        const toName = getSecondaryKeyName(toTable, indexName);

        const statement = builder.index(fromName).rename(toName);

        statements.push(statement.build());
        break;
      }
    }
  }

  return statements;
};

export const prepareDeleteIndexes = (builder: SqlBuilder, table: string, indexes: PgIndexRepository) => {
  const statements = [];

  for (const indexName in indexes) {
    const { type } = indexes[indexName];

    switch (type) {
      default:
        throw new Error(`Unsupported index type.`);

      case Index.Primary: {
        const name = getPrimaryKeyName(table, indexName);
        const statement = builder.table(table).alter().constraint(name).drop().existing();

        statements.push(statement.build());
        break;
      }

      case Index.Unique: {
        const name = getUniqueKeyName(table, indexName);
        const statement = builder.table(table).alter().constraint(name).drop().existing();

        statements.push(statement.build());
        break;
      }

      case Index.Secondary: {
        const name = getSecondaryKeyName(table, indexName);
        const statement = builder.index(name).drop().existing().concurrent();

        statements.push(statement.build());
        break;
      }
    }
  }

  return statements;
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
