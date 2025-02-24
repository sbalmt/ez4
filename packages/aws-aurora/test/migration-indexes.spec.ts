import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareCreateIndexes, prepareDeleteIndexes } from '@ez4/aws-aurora';
import { Index } from '@ez4/database';

describe.only('aurora migration (indexes)', () => {
  it('assert :: create index (primary)', () => {
    const statements = prepareCreateIndexes('ez4-test-table', {
      index: {
        name: 'index',
        columns: ['column_a', 'column_b'],
        type: Index.Primary
      }
    });

    deepEqual(statements, [
      `ALTER TABLE "ez4-test-table" ADD CONSTRAINT "ez4-test-table_index_pk" PRIMARY KEY ("column_a", "column_b")`
    ]);
  });

  it('assert :: create index (secondary)', () => {
    const statements = prepareCreateIndexes('ez4-test-table', {
      index: {
        name: 'index',
        columns: ['column_a', 'column_b'],
        type: Index.Secondary
      }
    });

    deepEqual(statements, [
      `CREATE INDEX "ez4-test-table_index_idx" ON "ez4-test-table" ("column_a", "column_b")`
    ]);
  });

  it('assert :: create index (unique)', () => {
    const statements = prepareCreateIndexes('ez4-test-table', {
      index: {
        name: 'index',
        columns: ['column_a', 'column_b'],
        type: Index.Unique
      }
    });

    deepEqual(statements, [
      `ALTER TABLE "ez4-test-table" ADD CONSTRAINT "ez4-test-table_index_unq" UNIQUE ("column_a", "column_b")`
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

    deepEqual(statements, [
      `ALTER TABLE "ez4-test-table" DROP CONSTRAINT IF EXISTS "ez4-test-table_index_pk"`
    ]);
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

  it('assert :: delete index (unique)', () => {
    const statements = prepareDeleteIndexes('ez4-test-table', {
      index: {
        name: 'index',
        columns: ['column_a', 'column_b'],
        type: Index.Unique
      }
    });

    deepEqual(statements, [
      `ALTER TABLE "ez4-test-table" DROP CONSTRAINT IF EXISTS "ez4-test-table_index_unq"`
    ]);
  });
});
