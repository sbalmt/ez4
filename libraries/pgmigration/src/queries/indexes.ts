import type { PgIndexRepository } from '@ez4/pgclient/library';
import type { ObjectComparison } from '@ez4/utils';
import type { ObjectSchema } from '@ez4/schema';
import type { SqlBuilder } from '@ez4/pgsql';
import type { PgMigrationQueries } from '../types/query';

import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { getPrimaryKeyName, getSecondaryKeyName, getUniqueKeyName } from '../utils/naming';
import { getCheckConstraintQuery } from '../utils/checks';

type IndexMigrationQueries = Pick<PgMigrationQueries, 'constraints' | 'validations' | 'indexes'>;

export namespace IndexQueries {
  export const prepareCreate = (builder: SqlBuilder, table: string, schema: ObjectSchema, indexes: PgIndexRepository) => {
    const statements: IndexMigrationQueries = {
      constraints: [],
      validations: [],
      indexes: []
    };

    for (const indexKey in indexes) {
      const { columns, type, name: indexName } = indexes[indexKey];

      switch (type) {
        default:
          throw new Error(`Unsupported index type.`);

        case Index.Primary: {
          const name = getPrimaryKeyName(table, indexName);

          statements.constraints.push({
            check: getCheckConstraintQuery(builder, name),
            query: builder.table(table).alter().existing().constraint(name).primary(columns).build()
          });

          break;
        }

        case Index.Unique: {
          const name = getUniqueKeyName(table, indexName);
          const type = getIndexType(columns, schema);

          statements.indexes.push({
            query: builder.index(name).create(table, columns).type(type).unique().concurrent().missing().build()
          });

          statements.validations.push({
            query: getValidationQuery(builder, name),
            name
          });

          break;
        }

        case Index.Secondary: {
          const name = getSecondaryKeyName(table, indexName);
          const type = getIndexType(columns, schema);

          statements.indexes.push({
            query: builder.index(name).create(table, columns).type(type).concurrent().missing().build()
          });

          statements.validations.push({
            query: getValidationQuery(builder, name),
            name
          });

          break;
        }
      }
    }

    return statements;
  };

  export const prepareUpdate = (
    builder: SqlBuilder,
    table: string,
    schema: ObjectSchema,
    sourceIndexes: PgIndexRepository,
    targetIndexes: PgIndexRepository,
    changes: Record<string, ObjectComparison>
  ) => {
    const statements: IndexMigrationQueries = {
      constraints: [],
      validations: [],
      indexes: []
    };

    for (const indexName in changes) {
      const { update, create, remove } = changes[indexName];

      if (remove || update) {
        const operation = prepareDelete(builder, table, { [indexName]: sourceIndexes[indexName] });

        statements.constraints.push(...operation.constraints);
        statements.indexes.push(...operation.indexes);
      }

      if (create || update) {
        const operation = prepareCreate(builder, table, schema, { [indexName]: targetIndexes[indexName] });

        statements.constraints.push(...operation.constraints);
        statements.indexes.push(...operation.indexes);
      }
    }

    return statements;
  };

  export const prepareRename = (builder: SqlBuilder, fromTable: string, toTable: string, indexes: PgIndexRepository) => {
    const statements: IndexMigrationQueries = {
      validations: [],
      constraints: [],
      indexes: []
    };

    for (const indexKey in indexes) {
      const { type, name: indexName } = indexes[indexKey];

      switch (type) {
        default:
          throw new Error(`Unsupported index type.`);

        case Index.Primary: {
          const fromName = getPrimaryKeyName(fromTable, indexName);
          const toName = getPrimaryKeyName(toTable, indexName);

          statements.constraints.push({
            check: getCheckConstraintQuery(builder, toName),
            query: builder.table(toTable).alter().existing().constraint(fromName).rename(toName).build()
          });

          break;
        }

        case Index.Unique: {
          const fromName = getUniqueKeyName(fromTable, indexName);
          const toName = getUniqueKeyName(toTable, indexName);

          statements.indexes.push({
            query: builder.index(fromName).rename(toName).existing().build()
          });

          break;
        }

        case Index.Secondary: {
          const fromName = getSecondaryKeyName(fromTable, indexName);
          const toName = getSecondaryKeyName(toTable, indexName);

          statements.indexes.push({
            query: builder.index(fromName).rename(toName).existing().build()
          });

          break;
        }
      }
    }

    return statements;
  };

  export const prepareDelete = (builder: SqlBuilder, table: string, indexes: PgIndexRepository) => {
    const statements: IndexMigrationQueries = {
      validations: [],
      constraints: [],
      indexes: []
    };

    for (const indexKey in indexes) {
      const { type, name: indexName } = indexes[indexKey];

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
          const query = builder.index(name).drop().existing().concurrent();

          statements.indexes.push({
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

  export const getValidationQuery = (builder: SqlBuilder, name: string) => {
    const [query] = builder
      .select()
      .rawColumn('1')
      .from('pg_index')
      .where({
        indexrelid: builder.rawValue(`${builder.rawString(name).build()}::regclass`),
        indisvalid: builder.rawValue('false'),
        indisready: builder.rawValue('true')
      })
      .build();

    return query;
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
