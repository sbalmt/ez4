import type { ObjectSchemaProperties } from '@ez4/schema';
import type { TableIndex } from '@ez4/database/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: create index tests', () => {
  const getDatabaseTables = (properties: ObjectSchemaProperties, indexes: TableIndex[] = []) => {
    return getTableRepository([
      {
        name: 'table',
        schema: {
          type: SchemaType.Object,
          properties
        },
        indexes
      }
    ]);
  };

  const singleColumn: ObjectSchemaProperties = {
    column: {
      type: SchemaType.String
    }
  };

  const compoundColumns: ObjectSchemaProperties = {
    column_a: {
      type: SchemaType.String
    },
    column_b: {
      type: SchemaType.String
    }
  };

  const singleJsonColumn: ObjectSchemaProperties = {
    column: {
      type: SchemaType.Object,
      properties: {}
    }
  };

  it('assert :: create primary index', async () => {
    const sourceTable = getDatabaseTables(singleColumn);

    const targetTable = getDatabaseTables(singleColumn, [
      {
        name: 'index',
        type: Index.Primary,
        columns: ['column']
      }
    ]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_index_pk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_index_pk" PRIMARY KEY ("column")`
        }
      ],
      validations: [],
      relations: [],
      indexes: []
    });
  });

  it('assert :: create unique index', async () => {
    const sourceTable = getDatabaseTables(singleColumn);

    const targetTable = getDatabaseTables(singleColumn, [
      {
        name: 'index',
        type: Index.Unique,
        columns: ['column']
      }
    ]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_index_uk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_index_uk" UNIQUE ("column")`
        }
      ],
      validations: [],
      relations: [],
      indexes: []
    });
  });

  it('assert :: create secondary index', async () => {
    const sourceTable = getDatabaseTables(singleColumn);

    const targetTable = getDatabaseTables(singleColumn, [
      {
        name: 'index',
        type: Index.Secondary,
        columns: ['column']
      }
    ]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [],
      constraints: [],
      validations: [],
      relations: [],
      indexes: [
        {
          query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_sk" ON "table" USING BTREE ("column")`
        }
      ]
    });
  });

  it('assert :: create primary index (compound)', async () => {
    const sourceTable = getDatabaseTables(compoundColumns);

    const targetTable = getDatabaseTables(compoundColumns, [
      {
        name: 'index',
        type: Index.Primary,
        columns: ['column_a', 'column_b']
      }
    ]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_index_pk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_index_pk" PRIMARY KEY ("column_a", "column_b")`
        }
      ],
      validations: [],
      relations: [],
      indexes: []
    });
  });

  it('assert :: create unique index (compound)', async () => {
    const sourceTable = getDatabaseTables(compoundColumns);

    const targetTable = getDatabaseTables(compoundColumns, [
      {
        name: 'index',
        type: Index.Unique,
        columns: ['column_a', 'column_b']
      }
    ]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_index_uk'`,
          query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_index_uk" UNIQUE ("column_a", "column_b")`
        }
      ],
      validations: [],
      relations: [],
      indexes: []
    });
  });

  it('assert :: create secondary index (compound)', async () => {
    const sourceTable = getDatabaseTables(compoundColumns);

    const targetTable = getDatabaseTables(compoundColumns, [
      {
        name: 'index',
        type: Index.Secondary,
        columns: ['column_a', 'column_b']
      }
    ]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [],
      constraints: [],
      validations: [],
      relations: [],
      indexes: [
        {
          query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_sk" ON "table" USING BTREE ("column_a", "column_b")`
        }
      ]
    });
  });

  it('assert :: create secondary index (gin)', async () => {
    const sourceTable = getDatabaseTables(singleJsonColumn);

    const targetTable = getDatabaseTables(singleJsonColumn, [
      {
        name: 'index',
        type: Index.Secondary,
        columns: ['column']
      }
    ]);

    const queries = getUpdateQueries(targetTable, sourceTable);

    deepEqual(queries, {
      tables: [],
      constraints: [],
      validations: [],
      relations: [],
      indexes: [
        {
          query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_sk" ON "table" USING GIN ("column")`
        }
      ]
    });
  });
});
