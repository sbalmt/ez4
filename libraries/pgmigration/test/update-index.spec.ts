import type { ObjectSchemaProperties } from '@ez4/schema';
import type { TableIndex } from '@ez4/database/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getUpdateStepQueries } from '@ez4/pgmigration';
import { getTableRepository } from '@ez4/pgclient/library';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('migration :: update index tests', () => {
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

  const primaryIndex: TableIndex = {
    name: 'index',
    type: Index.Primary,
    columns: ['column']
  };

  const secondaryIndex: TableIndex = {
    name: 'index',
    type: Index.Secondary,
    columns: ['column']
  };

  const uniqueIndex: TableIndex = {
    name: 'index',
    type: Index.Unique,
    columns: ['column']
  };

  it('assert :: update index type (from primary to unique)', async () => {
    const sourceTable = getDatabaseTables(singleColumn, [primaryIndex]);
    const targetTable = getDatabaseTables(singleColumn, [uniqueIndex]);

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [
          {
            query: 'ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_index_pk"'
          }
        ],
        validations: [],
        relations: [],
        indexes: [
          {
            query: 'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "table_index_uk" ON "table" USING BTREE ("column")'
          }
        ]
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: update index type (from primary to secondary)', async () => {
    const sourceTable = getDatabaseTables(singleColumn, [primaryIndex]);
    const targetTable = getDatabaseTables(singleColumn, [secondaryIndex]);

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [
          {
            query: 'ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_index_pk"'
          }
        ],
        validations: [],
        relations: [],
        indexes: [
          {
            query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_sk" ON "table" USING BTREE ("column")'
          }
        ]
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: update index type (from unique to primary)', async () => {
    const sourceTable = getDatabaseTables(singleColumn, [uniqueIndex]);
    const targetTable = getDatabaseTables(singleColumn, [primaryIndex]);

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_index_pk'`,
            query: 'ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_index_pk" PRIMARY KEY ("column")'
          }
        ],
        validations: [],
        relations: [],
        indexes: [
          {
            query: 'DROP INDEX CONCURRENTLY IF EXISTS "table_index_uk"'
          }
        ]
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: update index type (from unique to secondary)', async () => {
    const sourceTable = getDatabaseTables(singleColumn, [uniqueIndex]);
    const targetTable = getDatabaseTables(singleColumn, [secondaryIndex]);

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: [
          {
            query: 'DROP INDEX CONCURRENTLY IF EXISTS "table_index_uk"'
          },
          {
            query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_sk" ON "table" USING BTREE ("column")`
          }
        ]
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: update index type (from secondary to unique)', async () => {
    const sourceTable = getDatabaseTables(singleColumn, [secondaryIndex]);
    const targetTable = getDatabaseTables(singleColumn, [uniqueIndex]);

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: [
          {
            query: `DROP INDEX CONCURRENTLY IF EXISTS "table_index_sk"`
          },
          {
            query: 'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "table_index_uk" ON "table" USING BTREE ("column")'
          }
        ]
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: update index type (from secondary to primary)', async () => {
    const sourceTable = getDatabaseTables(singleColumn, [secondaryIndex]);
    const targetTable = getDatabaseTables(singleColumn, [primaryIndex]);

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_index_pk'`,
            query: 'ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_index_pk" PRIMARY KEY ("column")'
          }
        ],
        validations: [],
        relations: [],
        indexes: [
          {
            query: `DROP INDEX CONCURRENTLY IF EXISTS "table_index_sk"`
          }
        ]
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: update index columns (primary)', async () => {
    const sourceTable = getDatabaseTables(singleColumn, [primaryIndex]);
    const targetTable = getDatabaseTables(singleColumn, [{ ...primaryIndex, columns: [...primaryIndex.columns, 'other'] }]);

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [
          {
            query: 'ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_index_pk"'
          },
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_index_pk'`,
            query: 'ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_index_pk" PRIMARY KEY ("column", "other")'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: update index columns (unique)', async () => {
    const sourceTable = getDatabaseTables(singleColumn, [uniqueIndex]);
    const targetTable = getDatabaseTables(singleColumn, [{ ...uniqueIndex, columns: [...uniqueIndex.columns, 'other'] }]);

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: [
          {
            query: 'DROP INDEX CONCURRENTLY IF EXISTS "table_index_uk"'
          },
          {
            query: 'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "table_index_uk" ON "table" USING BTREE ("column", "other")'
          }
        ]
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: update index columns (secondary)', async () => {
    const sourceTable = getDatabaseTables(singleColumn, [secondaryIndex]);
    const targetTable = getDatabaseTables(singleColumn, [{ ...secondaryIndex, columns: [...secondaryIndex.columns, 'other'] }]);

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: [
          {
            query: 'DROP INDEX CONCURRENTLY IF EXISTS "table_index_sk"'
          },
          {
            query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_sk" ON "table" USING BTREE ("column", "other")'
          }
        ]
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: rename index (primary)', async () => {
    const sourceTable = getDatabaseTables(singleColumn, [primaryIndex]);
    const targetTable = getDatabaseTables(singleColumn, [{ ...primaryIndex, name: 'index_renamed' }]);

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_index_renamed_pk'`,
            query: 'ALTER TABLE IF EXISTS "table" RENAME CONSTRAINT "table_index_pk" TO "table_index_renamed_pk"'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: rename index (unique)', async () => {
    const sourceTable = getDatabaseTables(singleColumn, [uniqueIndex]);
    const targetTable = getDatabaseTables(singleColumn, [{ ...uniqueIndex, name: 'index_renamed' }]);

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: [
          {
            query: 'ALTER INDEX IF EXISTS "table_index_uk" RENAME TO "table_index_renamed_uk"'
          }
        ]
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: rename index (secondary)', async () => {
    const sourceTable = getDatabaseTables(singleColumn, [secondaryIndex]);
    const targetTable = getDatabaseTables(singleColumn, [{ ...secondaryIndex, name: 'index_renamed' }]);

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: [
          {
            query: 'ALTER INDEX IF EXISTS "table_index_sk" RENAME TO "table_index_renamed_sk"'
          }
        ]
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: rename and change index columns (secondary)', async () => {
    const sourceTable = getDatabaseTables(singleColumn, [secondaryIndex]);

    const targetTable = getDatabaseTables(singleColumn, [
      { ...secondaryIndex, columns: [...secondaryIndex.columns, 'other'], name: 'index_renamed' }
    ]);

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      create: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      update: {
        tables: [],
        constraints: [],
        validations: [
          {
            name: 'table_index_renamed_sk',
            query: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_index_renamed_sk'::regclass AND "indisvalid" = false AND "indisready" = true`
          }
        ],
        relations: [],
        indexes: [
          {
            query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_renamed_sk" ON "table" USING BTREE ("column", "other")'
          }
        ]
      },
      delete: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: [
          {
            query: 'DROP INDEX CONCURRENTLY IF EXISTS "table_index_sk"'
          }
        ]
      }
    });
  });
});
