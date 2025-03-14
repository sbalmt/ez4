import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { prepareCreateRelations, prepareDeleteRelations } from '@ez4/aws-aurora';
import { Index } from '@ez4/database';

describe('aurora migration (relations)', () => {
  it('assert :: create relation', () => {
    const statements = prepareCreateRelations('ez4-test-table', {
      relation: {
        sourceAlias: 'ez4-test-relation',
        targetColumn: 'target_column',
        sourceColumn: 'source_column',
        sourceIndex: Index.Primary,
        targetIndex: Index.Secondary
      }
    });

    deepEqual(statements, [
      `ALTER TABLE "ez4-test-table" ` +
        `ADD CONSTRAINT "ez4-test-table_relation_fk" ` +
        `FOREIGN KEY ("target_column") ` +
        `REFERENCES "ez4_test_relation" ("source_column") ` +
        `ON DELETE CASCADE ` +
        `ON UPDATE CASCADE`
    ]);
  });

  it('assert :: delete relation', () => {
    const statements = prepareDeleteRelations('ez4-test-table', {
      relation: {
        sourceAlias: 'ez4-test-relation',
        targetColumn: 'target_column',
        sourceColumn: 'source_column',
        sourceIndex: Index.Primary,
        targetIndex: Index.Secondary
      }
    });

    deepEqual(statements, [
      `ALTER TABLE "ez4-test-table" DROP CONSTRAINT IF EXISTS "ez4-test-table_relation_fk"`
    ]);
  });
});
