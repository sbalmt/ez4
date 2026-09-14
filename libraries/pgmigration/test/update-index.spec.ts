import type { ObjectSchemaProperties } from '@ez4/schema';
import type { TableIndex } from '@ez4/database/library';

import { deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

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
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [],
        constraints: [
          {
            query: 'ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_index_pk"'
          }
        ],
        validations: [
          {
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_index_uk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_index_uk"' || '%' LIMIT 1`,
            name: 'table_index_uk'
          }
        ],
        relations: [],
        indexes: [
          {
            assert: 'SELECT 1 FROM "table" WHERE "column" IS NOT null GROUP BY "column" HAVING COUNT(*) > 1 LIMIT 1',
            query: 'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "table_index_uk" ON "table" USING BTREE ("column")',
            name: 'table_index_uk'
          }
        ]
      },
      cleanup: {
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
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [],
        constraints: [
          {
            query: 'ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_index_pk"'
          }
        ],
        validations: [
          {
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_index_sk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_index_sk"' || '%' LIMIT 1`,
            name: 'table_index_sk'
          }
        ],
        relations: [],
        indexes: [
          {
            query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_sk" ON "table" USING BTREE ("column")'
          }
        ]
      },
      cleanup: {
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
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
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
      cleanup: {
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
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [],
        constraints: [],
        validations: [
          {
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_index_sk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_index_sk"' || '%' LIMIT 1`,
            name: 'table_index_sk'
          }
        ],
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
      cleanup: {
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
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [],
        constraints: [],
        validations: [
          {
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_index_uk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_index_uk"' || '%' LIMIT 1`,
            name: 'table_index_uk'
          }
        ],
        relations: [],
        indexes: [
          {
            query: `DROP INDEX CONCURRENTLY IF EXISTS "table_index_sk"`
          },
          {
            assert: 'SELECT 1 FROM "table" WHERE "column" IS NOT null GROUP BY "column" HAVING COUNT(*) > 1 LIMIT 1',
            query: 'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "table_index_uk" ON "table" USING BTREE ("column")',
            name: 'table_index_uk'
          }
        ]
      },
      cleanup: {
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
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
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
      cleanup: {
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
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
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
      cleanup: {
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
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [],
        constraints: [],
        validations: [
          {
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_index_uk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_index_uk"' || '%' LIMIT 1`,
            name: 'table_index_uk'
          }
        ],
        relations: [],
        indexes: [
          {
            query: 'DROP INDEX CONCURRENTLY IF EXISTS "table_index_uk"'
          },
          {
            assert:
              'SELECT 1 FROM "table" WHERE "column" IS NOT null AND "other" IS NOT null GROUP BY "column", "other" HAVING COUNT(*) > 1 LIMIT 1',
            query: 'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "table_index_uk" ON "table" USING BTREE ("column", "other")',
            name: 'table_index_uk'
          }
        ]
      },
      cleanup: {
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
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [],
        constraints: [],
        validations: [
          {
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_index_sk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_index_sk"' || '%' LIMIT 1`,
            name: 'table_index_sk'
          }
        ],
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
      cleanup: {
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

    const targetTable = getDatabaseTables(singleColumn, [
      {
        ...primaryIndex,
        name: 'index_renamed'
      }
    ]);

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
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
      cleanup: {
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
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
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
      cleanup: {
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
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
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
      cleanup: {
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
      {
        ...secondaryIndex,
        columns: [...secondaryIndex.columns, 'other'],
        name: 'index_renamed'
      }
    ]);

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [],
        constraints: [],
        validations: [
          {
            name: 'table_index_renamed_sk',
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_index_renamed_sk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_index_renamed_sk"' || '%' LIMIT 1`
          }
        ],
        relations: [],
        indexes: [
          {
            query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_renamed_sk" ON "table" USING BTREE ("column", "other")'
          }
        ]
      },
      cleanup: {
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

  it('assert :: rename index (primary with table)', () => {
    const sourceTable = getDatabaseTables(singleColumn, [primaryIndex]);

    const targetTable = {
      renamed_table: {
        ...sourceTable.table,
        name: 'renamed_table'
      }
    };

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [
          {
            query: 'ALTER TABLE IF EXISTS "table" RENAME TO "renamed_table"'
          }
        ],
        constraints: [
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'renamed_table_index_pk'`,
            query: 'ALTER TABLE IF EXISTS "renamed_table" RENAME CONSTRAINT "table_index_pk" TO "renamed_table_index_pk"'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      },
      cleanup: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: rename index (unique with table)', () => {
    const sourceTable = getDatabaseTables(singleColumn, [uniqueIndex]);

    const targetTable = {
      renamed_table: {
        ...sourceTable.table,
        name: 'renamed_table'
      }
    };

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [
          {
            query: 'ALTER TABLE IF EXISTS "table" RENAME TO "renamed_table"'
          }
        ],
        constraints: [],
        validations: [],
        relations: [],
        indexes: [
          {
            query: 'ALTER INDEX IF EXISTS "table_index_uk" RENAME TO "renamed_table_index_uk"'
          }
        ]
      },
      cleanup: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: rename index (secondary with table)', () => {
    const sourceTable = getDatabaseTables(singleColumn, [secondaryIndex]);

    const targetTable = {
      renamed_table: {
        ...sourceTable.table,
        name: 'renamed_table'
      }
    };

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [
          {
            query: 'ALTER TABLE IF EXISTS "table" RENAME TO "renamed_table"'
          }
        ],
        constraints: [],
        validations: [],
        relations: [],
        indexes: [
          {
            query: 'ALTER INDEX IF EXISTS "table_index_sk" RENAME TO "renamed_table_index_sk"'
          }
        ]
      },
      cleanup: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: rename index (primary with column)', () => {
    const sourceTable = getDatabaseTables(singleColumn, [primaryIndex]);

    const targetTable = getDatabaseTables(
      {
        renamed_column: singleColumn.column
      },
      [
        {
          ...primaryIndex,
          columns: ['renamed_column']
        }
      ]
    );

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [
          {
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" RENAME COLUMN "column" TO "renamed_column"'
          }
        ],
        constraints: [
          {
            query: 'ALTER TABLE IF EXISTS "table" DROP CONSTRAINT IF EXISTS "table_index_pk"'
          },
          {
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_index_pk'`,
            query: 'ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_index_pk" PRIMARY KEY ("renamed_column")'
          }
        ],
        validations: [],
        relations: [],
        indexes: []
      },
      cleanup: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: rename index (unique with column)', () => {
    const sourceTable = getDatabaseTables(singleColumn, [uniqueIndex]);

    const targetTable = getDatabaseTables(
      {
        renamed_column: singleColumn.column
      },
      [
        {
          ...uniqueIndex,
          columns: ['renamed_column']
        }
      ]
    );

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [
          {
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" RENAME COLUMN "column" TO "renamed_column"'
          }
        ],
        constraints: [],
        validations: [
          {
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_index_uk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_index_uk"' || '%' LIMIT 1`,
            name: 'table_index_uk'
          }
        ],
        relations: [],
        indexes: [
          {
            query: 'DROP INDEX CONCURRENTLY IF EXISTS "table_index_uk"'
          },
          {
            assert: 'SELECT 1 FROM "table" WHERE "renamed_column" IS NOT null GROUP BY "renamed_column" HAVING COUNT(*) > 1 LIMIT 1',
            query: 'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "table_index_uk" ON "table" USING BTREE ("renamed_column")',
            name: 'table_index_uk'
          }
        ]
      },
      cleanup: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });

  it('assert :: rename index (secondary with column)', () => {
    const sourceTable = getDatabaseTables(singleColumn, [secondaryIndex]);

    const targetTable = getDatabaseTables(
      {
        renamed_column: singleColumn.column
      },
      [
        {
          ...secondaryIndex,
          columns: ['renamed_column']
        }
      ]
    );

    const steps = getUpdateStepQueries(targetTable, sourceTable);

    deepEqual(steps, {
      prepare: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      },
      rollout: {
        tables: [
          {
            check: `SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE "column_name" = 'column' AND "table_name" = 'table')`,
            query: 'ALTER TABLE IF EXISTS "table" RENAME COLUMN "column" TO "renamed_column"'
          }
        ],
        constraints: [],
        validations: [
          {
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_index_sk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_index_sk"' || '%' LIMIT 1`,
            name: 'table_index_sk'
          }
        ],
        relations: [],
        indexes: [
          {
            query: 'DROP INDEX CONCURRENTLY IF EXISTS "table_index_sk"'
          },
          {
            query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_sk" ON "table" USING BTREE ("renamed_column")'
          }
        ]
      },
      cleanup: {
        tables: [],
        constraints: [],
        validations: [],
        relations: [],
        indexes: []
      }
    });
  });
});
