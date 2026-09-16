import type { PgStatementMetadata } from '../../src/types/driver';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { Index } from '@ez4/database';

import { parseRecords } from '../../src/utils/records';

describe('record parsing utils', () => {
  const metadata: PgStatementMetadata = {
    table: 'table',
    columns: [],
    relations: {
      'table.relation': {
        primaryColumn: 'id',
        targetAlias: 'relation',
        targetColumn: 'relation_id',
        targetIndex: Index.Secondary,
        targetTable: 'table',
        sourceTable: 'source',
        sourceColumn: 'id',
        sourceIndex: Index.Primary,
        sourceSchema: {
          type: SchemaType.Object,
          properties: {}
        }
      }
    },
    schema: {
      type: SchemaType.Object,
      properties: {
        amount: {
          type: SchemaType.Number
        },
        data: {
          type: SchemaType.Object,
          properties: {}
        }
      }
    }
  };

  it('assert :: parse schema and relation values', () => {
    const input = [
      {
        amount: '12.5',
        data: '{"foo":"bar"}',
        relation: '[{"id":1}]',
        nullable: null
      }
    ];

    const records = parseRecords(input, metadata);

    deepEqual(records, [
      {
        amount: 12.5,
        data: { foo: 'bar' },
        relation: [{ id: 1 }],
        nullable: null
      }
    ]);
  });

  it('assert :: parse empty record', () => {
    const input = [{}];
    const records = parseRecords(input, metadata);

    deepEqual(records, [undefined]);
  });
});
