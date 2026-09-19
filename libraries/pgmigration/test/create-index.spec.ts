import type { ObjectSchemaProperties } from '@ez4/schema';
import type { TableIndex } from '@ez4/database/library';

import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { getCreateQueries, getUpdateStepQueries } from '@ez4/pgmigration';
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

  it('assert :: create unique index (with table)', () => {
    const targetTable = getDatabaseTables(singleColumn, [
      {
        name: 'index',
        type: Index.Unique,
        columns: ['column']
      }
    ]);

    const queries = getCreateQueries(targetTable);

    deepEqual(queries, {
      tables: [
        {
          query: 'CREATE TABLE IF NOT EXISTS "table" ("column" text NOT null)'
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
          assert: 'SELECT 1 FROM "table" WHERE "column" IS NOT null GROUP BY "column" HAVING COUNT(*) > 1 LIMIT 1',
          query: 'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "table_index_uk" ON "table" USING BTREE ("column")',
          name: 'table_index_uk'
        }
      ]
    });
  });

  it('assert :: create secondary index (with table)', () => {
    const targetTable = getDatabaseTables(singleColumn, [
      {
        name: 'index',
        type: Index.Secondary,
        columns: ['column']
      }
    ]);

    const queries = getCreateQueries(targetTable);

    deepEqual(queries, {
      tables: [
        {
          query: 'CREATE TABLE IF NOT EXISTS "table" ("column" text NOT null)'
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
          query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_sk" ON "table" USING BTREE ("column")'
        }
      ]
    });
  });

  it('assert :: create primary index (compound with table)', () => {
    const targetTable = getDatabaseTables(compoundColumns, [
      {
        name: 'index',
        type: Index.Primary,
        columns: ['column_a', 'column_b']
      }
    ]);

    const queries = getCreateQueries(targetTable);

    deepEqual(queries, {
      tables: [
        {
          query: 'CREATE TABLE IF NOT EXISTS "table" ("column_a" text NOT null, "column_b" text NOT null)'
        }
      ],
      constraints: [
        {
          check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_index_pk'`,
          query: 'ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_index_pk" PRIMARY KEY ("column_a", "column_b")'
        }
      ],
      validations: [],
      relations: [],
      indexes: []
    });
  });

  it('assert :: create unique index (compound with table)', () => {
    const targetTable = getDatabaseTables(compoundColumns, [
      {
        name: 'index',
        type: Index.Unique,
        columns: ['column_a', 'column_b']
      }
    ]);

    const queries = getCreateQueries(targetTable);

    deepEqual(queries, {
      tables: [
        {
          query: 'CREATE TABLE IF NOT EXISTS "table" ("column_a" text NOT null, "column_b" text NOT null)'
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
          assert:
            'SELECT 1 FROM "table" WHERE "column_a" IS NOT null AND "column_b" IS NOT null GROUP BY "column_a", "column_b" HAVING COUNT(*) > 1 LIMIT 1',
          query: 'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "table_index_uk" ON "table" USING BTREE ("column_a", "column_b")',
          name: 'table_index_uk'
        }
      ]
    });
  });

  it('assert :: create secondary index (compound with table)', () => {
    const targetTable = getDatabaseTables(compoundColumns, [
      {
        name: 'index',
        type: Index.Secondary,
        columns: ['column_a', 'column_b']
      }
    ]);

    const queries = getCreateQueries(targetTable);

    deepEqual(queries, {
      tables: [
        {
          query: 'CREATE TABLE IF NOT EXISTS "table" ("column_a" text NOT null, "column_b" text NOT null)'
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
          query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_sk" ON "table" USING BTREE ("column_a", "column_b")'
        }
      ]
    });
  });

  it('assert :: create secondary index (gin with table)', () => {
    const targetTable = getDatabaseTables(singleJsonColumn, [
      {
        name: 'index',
        type: Index.Secondary,
        columns: ['column']
      }
    ]);

    const queries = getCreateQueries(targetTable);

    deepEqual(queries, {
      tables: [
        {
          query: 'CREATE TABLE IF NOT EXISTS "table" ("column" jsonb NOT null)'
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
          query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_sk" ON "table" USING GIN ("column")'
        }
      ]
    });
  });

  it('assert :: create primary index', async () => {
    const sourceTable = getDatabaseTables(singleColumn);

    const targetTable = getDatabaseTables(singleColumn, [
      {
        name: 'index',
        type: Index.Primary,
        columns: ['column']
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
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_index_pk'`,
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_index_pk" PRIMARY KEY ("column")`
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

  it('assert :: create unique index', async () => {
    const sourceTable = getDatabaseTables(singleColumn);

    const targetTable = getDatabaseTables(singleColumn, [
      {
        name: 'index',
        type: Index.Unique,
        columns: ['column']
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

  it('assert :: create secondary index', async () => {
    const sourceTable = getDatabaseTables(singleColumn);

    const targetTable = getDatabaseTables(singleColumn, [
      {
        name: 'index',
        type: Index.Secondary,
        columns: ['column']
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
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_index_sk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_index_sk"' || '%' LIMIT 1`,
            name: 'table_index_sk'
          }
        ],
        relations: [],
        indexes: [
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

  it('assert :: create primary index (compound)', async () => {
    const sourceTable = getDatabaseTables(compoundColumns);

    const targetTable = getDatabaseTables(compoundColumns, [
      {
        name: 'index',
        type: Index.Primary,
        columns: ['column_a', 'column_b']
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
            check: `SELECT 1 FROM "pg_constraint" WHERE "conname" = 'table_index_pk'`,
            query: `ALTER TABLE IF EXISTS "table" ADD CONSTRAINT "table_index_pk" PRIMARY KEY ("column_a", "column_b")`
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

  it('assert :: create unique index (compound)', async () => {
    const sourceTable = getDatabaseTables(compoundColumns);

    const targetTable = getDatabaseTables(compoundColumns, [
      {
        name: 'index',
        type: Index.Unique,
        columns: ['column_a', 'column_b']
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
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_index_uk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_index_uk"' || '%' LIMIT 1`,
            name: 'table_index_uk'
          }
        ],
        relations: [],
        indexes: [
          {
            assert:
              'SELECT 1 FROM "table" WHERE "column_a" IS NOT null AND "column_b" IS NOT null GROUP BY "column_a", "column_b" HAVING COUNT(*) > 1 LIMIT 1',
            query: 'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "table_index_uk" ON "table" USING BTREE ("column_a", "column_b")',
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

  it('assert :: create secondary index (compound)', async () => {
    const sourceTable = getDatabaseTables(compoundColumns);

    const targetTable = getDatabaseTables(compoundColumns, [
      {
        name: 'index',
        type: Index.Secondary,
        columns: ['column_a', 'column_b']
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
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_index_sk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_index_sk"' || '%' LIMIT 1`,
            name: 'table_index_sk'
          }
        ],
        relations: [],
        indexes: [
          {
            query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_sk" ON "table" USING BTREE ("column_a", "column_b")`
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

  it('assert :: create secondary index (gin)', async () => {
    const sourceTable = getDatabaseTables(singleJsonColumn);

    const targetTable = getDatabaseTables(singleJsonColumn, [
      {
        name: 'index',
        type: Index.Secondary,
        columns: ['column']
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
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'table_index_sk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"table_index_sk"' || '%' LIMIT 1`,
            name: 'table_index_sk'
          }
        ],
        relations: [],
        indexes: [
          {
            query: `CREATE INDEX CONCURRENTLY IF NOT EXISTS "table_index_sk" ON "table" USING GIN ("column")`
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

  it('assert :: create primary index (with table rename)', () => {
    const sourceTable = getDatabaseTables(singleColumn);

    const newTable = getDatabaseTables(singleColumn, [
      {
        name: 'index',
        type: Index.Primary,
        columns: ['column']
      }
    ]);

    const targetTable = {
      renamed_table: {
        ...newTable.table,
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
            query: 'ALTER TABLE IF EXISTS "renamed_table" ADD CONSTRAINT "renamed_table_index_pk" PRIMARY KEY ("column")'
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

  it('assert :: create unique index (with table rename)', () => {
    const sourceTable = getDatabaseTables(singleColumn);

    const newTable = getDatabaseTables(singleColumn, [
      {
        name: 'index',
        type: Index.Unique,
        columns: ['column']
      }
    ]);

    const targetTable = {
      renamed_table: {
        ...newTable.table,
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
        validations: [
          {
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'renamed_table_index_uk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"renamed_table_index_uk"' || '%' LIMIT 1`,
            name: 'renamed_table_index_uk'
          }
        ],
        relations: [],
        indexes: [
          {
            assert: 'SELECT 1 FROM "renamed_table" WHERE "column" IS NOT null GROUP BY "column" HAVING COUNT(*) > 1 LIMIT 1',
            query: 'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "renamed_table_index_uk" ON "renamed_table" USING BTREE ("column")',
            name: 'renamed_table_index_uk'
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

  it('assert :: create secondary index (with table rename)', () => {
    const sourceTable = getDatabaseTables(singleColumn);

    const newTable = getDatabaseTables(singleColumn, [
      {
        name: 'index',
        type: Index.Secondary,
        columns: ['column']
      }
    ]);

    const targetTable = {
      renamed_table: {
        ...newTable.table,
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
        validations: [
          {
            check: `SELECT 1 FROM "pg_index" WHERE "indexrelid" = 'renamed_table_index_sk'::regclass AND ("indisvalid" = false OR "indisready" = false)`,
            retry: `SELECT 1 FROM "pg_stat_activity" WHERE "state" = 'active' AND "query" ILIKE '%' || '"renamed_table_index_sk"' || '%' LIMIT 1`,
            name: 'renamed_table_index_sk'
          }
        ],
        relations: [],
        indexes: [
          {
            query: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS "renamed_table_index_sk" ON "renamed_table" USING BTREE ("column")'
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
