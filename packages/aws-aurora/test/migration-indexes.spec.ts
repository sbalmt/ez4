import type { ObjectSchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareCreateIndexes, prepareDeleteIndexes } from '@ez4/aws-aurora';
import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

describe('aurora migration (indexes)', () => {
  const tableSchema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {}
  };

  it('assert :: create index (primary)', () => {
    const statements = prepareCreateIndexes('ez4-test-table', tableSchema, {
      index: {
        name: 'index',
        columns: ['column_a', 'column_b'],
        type: Index.Primary
      }
    });

    deepEqual(statements, [`ALTER TABLE "ez4-test-table" ADD CONSTRAINT "ez4-test-table_index_pk" PRIMARY KEY ("column_a", "column_b")`]);
  });

  it('assert :: create index (unique)', () => {
    const statements = prepareCreateIndexes('ez4-test-table', tableSchema, {
      index: {
        name: 'index',
        columns: ['column_a', 'column_b'],
        type: Index.Unique
      }
    });

    deepEqual(statements, [`ALTER TABLE "ez4-test-table" ADD CONSTRAINT "ez4-test-table_index_unq" UNIQUE ("column_a", "column_b")`]);
  });

  it('assert :: create index (secondary)', () => {
    const statements = prepareCreateIndexes('ez4-test-table', tableSchema, {
      index: {
        name: 'index',
        columns: ['column_a', 'column_b'],
        type: Index.Secondary
      }
    });

    deepEqual(statements, [
      `CREATE INDEX IF NOT EXISTS "ez4-test-table_index_idx" ON "ez4-test-table" USING BTREE ("column_a", "column_b")`
    ]);
  });

  it('assert :: create index concurrently (secondary)', () => {
    const statements = prepareCreateIndexes(
      'ez4-test-table',
      tableSchema,
      {
        index: {
          name: 'index',
          columns: ['column_a', 'column_b'],
          type: Index.Secondary
        }
      },
      true
    );

    deepEqual(statements, [
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS "ez4-test-table_index_idx" ON "ez4-test-table" USING BTREE ("column_a", "column_b")`
    ]);
  });

  it('assert :: delete index (primary)', () => {
    const statements = prepareDeleteIndexes('ez4-test-table', {
      index: {
        name: 'index',
        columns: ['column_a', 'column_b'],
        type: Index.Primary
      }
    });

    deepEqual(statements, [`ALTER TABLE "ez4-test-table" DROP CONSTRAINT IF EXISTS "ez4-test-table_index_pk"`]);
  });

  it('assert :: delete index (unique)', () => {
    const statements = prepareDeleteIndexes('ez4-test-table', {
      index: {
        name: 'index',
        columns: ['column_a', 'column_b'],
        type: Index.Unique
      }
    });

    deepEqual(statements, [`ALTER TABLE "ez4-test-table" DROP CONSTRAINT IF EXISTS "ez4-test-table_index_unq"`]);
  });

  it('assert :: delete index (secondary)', () => {
    const statements = prepareDeleteIndexes('ez4-test-table', {
      index: {
        name: 'index',
        columns: ['column_a', 'column_b'],
        type: Index.Secondary
      }
    });

    deepEqual(statements, [`DROP INDEX IF EXISTS "ez4-test-table_index_idx"`]);
  });

  it('assert :: delete index concurrently (secondary)', () => {
    const statements = prepareDeleteIndexes(
      'ez4-test-table',
      {
        index: {
          name: 'index',
          columns: ['column_a', 'column_b'],
          type: Index.Secondary
        }
      },
      true
    );

    deepEqual(statements, [`DROP INDEX CONCURRENTLY IF EXISTS "ez4-test-table_index_idx"`]);
  });
});
