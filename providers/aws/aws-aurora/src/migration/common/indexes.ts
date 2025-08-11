import type { PgIndexRepository } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';

import { joinString, toSnakeCase } from '@ez4/utils';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

export const prepareCreateIndexes = (table: string, schema: ObjectSchema, indexes: PgIndexRepository, concurrently = false) => {
  const statements = [];

  for (const indexName in indexes) {
    if (!indexes[indexName]) {
      continue;
    }

    const { columns, type } = indexes[indexName];

    const columnsList = columns.map((column) => `"${column}"`).join(', ');

    switch (type) {
      case Index.Primary: {
        const primaryIndexName = getPrimaryKey(table, indexName);

        statements.push(`ALTER TABLE "${table}" ADD CONSTRAINT "${primaryIndexName}" PRIMARY KEY (${columnsList})`);
        break;
      }

      case Index.Unique: {
        const uniqueIndexName = getUniqueKey(table, indexName);

        statements.push(`ALTER TABLE "${table}" ADD CONSTRAINT "${uniqueIndexName}" UNIQUE (${columnsList})`);
        break;
      }

      case Index.Secondary: {
        const secondaryIndexName = getSecondaryKey(table, indexName);
        const secondaryIndexType = getIndexType(columns, schema);

        statements.push(
          joinString(' ', [
            'CREATE INDEX',
            concurrently ? 'CONCURRENTLY' : null,
            `IF NOT EXISTS "${secondaryIndexName}"`,
            `ON "${table}" USING ${secondaryIndexType} (${columnsList})`
          ])
        );

        break;
      }
    }
  }

  return statements;
};

export const prepareUpdateIndexes = (
  table: string,
  schema: ObjectSchema,
  toCreate: PgIndexRepository,
  toRemove: PgIndexRepository,
  concurrently = false
) => {
  return [...prepareDeleteIndexes(table, toRemove, concurrently), ...prepareCreateIndexes(table, schema, toCreate, concurrently)];
};

export const prepareDeleteIndexes = (table: string, indexes: PgIndexRepository, concurrently = false) => {
  const statements = [];

  for (const indexName in indexes) {
    if (!indexes[indexName]) {
      continue;
    }

    const { type } = indexes[indexName];

    switch (type) {
      case Index.Primary: {
        const primaryIndexName = getPrimaryKey(table, indexName);

        statements.push(`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${primaryIndexName}"`);
        break;
      }

      case Index.Unique: {
        const uniqueIndexName = getUniqueKey(table, indexName);

        statements.push(`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${uniqueIndexName}"`);
        break;
      }

      case Index.Secondary: {
        const secondaryIndexName = getSecondaryKey(table, indexName);

        statements.push(joinString(' ', ['DROP INDEX', concurrently ? 'CONCURRENTLY' : null, `IF EXISTS "${secondaryIndexName}"`]));
        break;
      }
    }
  }

  return statements;
};

const getName = (table: string, name: string) => {
  return `${table}_${toSnakeCase(name.replaceAll(':', '_'))}`;
};

const getPrimaryKey = (table: string, name: string) => {
  return `${getName(table, name)}_pk`;
};

const getUniqueKey = (table: string, name: string) => {
  return `${getName(table, name)}_uq`;
};

const getSecondaryKey = (table: string, name: string) => {
  return `${getName(table, name)}_ix`;
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
