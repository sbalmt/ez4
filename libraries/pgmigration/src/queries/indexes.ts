import type { PgIndexRepository } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';
import type { SqlBuilder } from '@ez4/pgsql';
import type { PgMigrationQueries } from '../types/query';

import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { getPrimaryKeyName, getSecondaryKeyName, getUniqueKeyName } from '../utils/naming';
import { getCheckConstraintQuery } from '../utils/checks';

type IndexMigrationQueries = Pick<PgMigrationQueries, 'constraints' | 'indexes'>;

export namespace IndexQueries {
  export const prepareCreate = (
    builder: SqlBuilder,
    table: string,
    schema: ObjectSchema,
    indexes: PgIndexRepository,
    concurrent: boolean
  ) => {
    const statements: IndexMigrationQueries = {
      constraints: [],
      indexes: []
    };

    for (const indexName in indexes) {
      const { columns, type } = indexes[indexName];

      switch (type) {
        default:
          throw new Error(`Unsupported index type.`);

        case Index.Primary: {
          const name = getPrimaryKeyName(table, indexName);

          const query = builder.table(table).alter().existing().constraint(name).primary(columns);

          statements.constraints.push({
            check: getCheckConstraintQuery(builder, name),
            query: query.build()
          });

          break;
        }

        case Index.Unique: {
          const name = getUniqueKeyName(table, indexName);

          const query = builder.table(table).alter().existing().constraint(name).unique(columns);

          statements.constraints.push({
            check: getCheckConstraintQuery(builder, name),
            query: query.build()
          });

          break;
        }

        case Index.Secondary: {
          const name = getSecondaryKeyName(table, indexName);
          const type = getIndexType(columns, schema);

          const query = builder.index(name).create(table, columns).type(type).missing();

          if (concurrent) {
            query.concurrent();
          }

          statements.indexes.push({
            query: query.build()
          });

          break;
        }
      }
    }

    return statements;
  };

  export const prepareRename = (builder: SqlBuilder, fromTable: string, toTable: string, indexes: PgIndexRepository) => {
    const statements: IndexMigrationQueries = {
      constraints: [],
      indexes: []
    };

    for (const indexName in indexes) {
      const { type } = indexes[indexName];

      switch (type) {
        default:
          throw new Error(`Unsupported index type.`);

        case Index.Primary: {
          const fromName = getPrimaryKeyName(fromTable, indexName);
          const toName = getPrimaryKeyName(toTable, indexName);

          const query = builder.table(toTable).alter().existing().constraint(fromName).rename(toName);

          statements.constraints.push({
            check: getCheckConstraintQuery(builder, toName),
            query: query.build()
          });

          break;
        }

        case Index.Unique: {
          const fromName = getUniqueKeyName(fromTable, indexName);
          const toName = getUniqueKeyName(toTable, indexName);

          const query = builder.table(toTable).alter().existing().constraint(fromName).rename(toName);

          statements.constraints.push({
            check: getCheckConstraintQuery(builder, toName),
            query: query.build()
          });

          break;
        }

        case Index.Secondary: {
          const fromName = getSecondaryKeyName(fromTable, indexName);
          const toName = getSecondaryKeyName(toTable, indexName);

          const query = builder.index(fromName).rename(toName).existing();

          statements.indexes.push({
            query: query.build()
          });

          break;
        }
      }
    }

    return statements;
  };

  export const prepareDelete = (builder: SqlBuilder, table: string, indexes: PgIndexRepository) => {
    const statements: IndexMigrationQueries = {
      constraints: [],
      indexes: []
    };

    for (const indexName in indexes) {
      const { type } = indexes[indexName];

      switch (type) {
        default:
          throw new Error(`Unsupported index type.`);

        case Index.Primary: {
          const name = getPrimaryKeyName(table, indexName);

          const query = builder.table(table).alter().existing().constraint(name).drop().existing();

          statements.constraints.push({
            query: query.build()
          });

          break;
        }

        case Index.Unique: {
          const name = getUniqueKeyName(table, indexName);

          const query = builder.table(table).alter().existing().constraint(name).drop().existing();

          statements.constraints.push({
            query: query.build()
          });

          break;
        }

        case Index.Secondary: {
          const name = getSecondaryKeyName(table, indexName);

          const query = builder.index(name).drop().existing().concurrent();

          statements.indexes.push({
            query: query.build()
          });

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
}
