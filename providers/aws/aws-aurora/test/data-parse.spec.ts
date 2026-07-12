import type { Field, ColumnMetadata } from '@aws-sdk/client-rds-data';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseFieldRecords } from '@ez4/aws-aurora/client';

const read = (fields: Field[], columns: ColumnMetadata[]) => {
  return parseFieldRecords([fields], columns)[0];
};

describe('aurora data parse', () => {
  it('assert :: parse string value', () => {
    const result = read([{ stringValue: 'foo' }], [{ name: 'field' }]);

    deepEqual(result, {
      field: 'foo'
    });
  });

  it('assert :: parse long value', () => {
    const result = read([{ longValue: 123 }], [{ name: 'field' }]);

    deepEqual(result, {
      field: 123
    });
  });

  it('assert :: parse double value', () => {
    const result = read([{ doubleValue: 4.56 }], [{ name: 'field' }]);

    deepEqual(result, {
      field: 4.56
    });
  });

  it('assert :: parse boolean value', () => {
    const result = read([{ booleanValue: false }], [{ name: 'field' }]);

    deepEqual(result, {
      field: false
    });
  });

  it('assert :: parse null value', () => {
    const result = read([{ isNull: true }], [{ name: 'field' }]);

    deepEqual(result, {
      field: null
    });
  });

  it('assert :: parse array value', () => {
    const result = read([{ arrayValue: { stringValues: ['a', 'b'] } }], [{ name: 'field' }]);

    deepEqual(result, {
      field: ['a', 'b']
    });
  });

  it('assert :: parse multiple columns', () => {
    const result = read(
      [{ stringValue: '00000000-0000-0000-0000-000000000000' }, { longValue: 42 }, { booleanValue: true }],
      [{ name: 'id' }, { name: 'score' }, { name: 'active' }]
    );

    deepEqual(result, {
      id: '00000000-0000-0000-0000-000000000000',
      score: 42,
      active: true
    });
  });

  it('assert :: parse multiple rows', () => {
    const result = parseFieldRecords([[{ stringValue: 'a' }], [{ stringValue: 'b' }]], [{ name: 'field' }]);

    deepEqual(result, [
      {
        field: 'a'
      },
      {
        field: 'b'
      }
    ]);
  });

  it('assert :: keep json string raw (parsed later by the record parser)', () => {
    const result = read([{ stringValue: '{"foo":1}' }], [{ name: 'field' }]);

    deepEqual(result, {
      field: '{"foo":1}'
    });
  });

  it('assert :: prefer column label over name (alias)', () => {
    const result = read([{ longValue: 1 }], [{ name: 'ranking', label: 'rank' }]);

    deepEqual(result, {
      rank: 1
    });
  });
});
