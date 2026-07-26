import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseRecordsWithMetadata } from '@ez4/aws-aurora/client';

describe('aurora data parse', () => {
  it('assert :: parse string value', () => {
    const result = parseRecordsWithMetadata([[{ stringValue: 'foo' }]], [{ name: 'field' }]);

    deepEqual(result, [
      {
        field: 'foo'
      }
    ]);
  });

  it('assert :: parse long value', () => {
    const result = parseRecordsWithMetadata([[{ longValue: 123 }]], [{ name: 'field' }]);

    deepEqual(result, [
      {
        field: 123
      }
    ]);
  });

  it('assert :: parse double value', () => {
    const result = parseRecordsWithMetadata([[{ doubleValue: 4.56 }]], [{ name: 'field' }]);

    deepEqual(result, [
      {
        field: 4.56
      }
    ]);
  });

  it('assert :: parse boolean value', () => {
    const result = parseRecordsWithMetadata([[{ booleanValue: false }]], [{ name: 'field' }]);

    deepEqual(result, [
      {
        field: false
      }
    ]);
  });

  it('assert :: parse null value', () => {
    const result = parseRecordsWithMetadata([[{ isNull: true }]], [{ name: 'field' }]);

    deepEqual(result, [
      {
        field: null
      }
    ]);
  });

  it('assert :: parse array value', () => {
    const result = parseRecordsWithMetadata([[{ arrayValue: { stringValues: ['a', 'b'] } }]], [{ name: 'field' }]);

    deepEqual(result, [
      {
        field: ['a', 'b']
      }
    ]);
  });

  it('assert :: parse multiple columns', () => {
    const result = parseRecordsWithMetadata(
      [[{ stringValue: '00000000-0000-0000-0000-000000000000' }, { longValue: 42 }, { booleanValue: true }]],
      [{ name: 'id' }, { name: 'score' }, { name: 'active' }]
    );

    deepEqual(result, [
      {
        id: '00000000-0000-0000-0000-000000000000',
        score: 42,
        active: true
      }
    ]);
  });

  it('assert :: parse multiple rows', () => {
    const result = parseRecordsWithMetadata([[{ stringValue: 'a' }], [{ stringValue: 'b' }]], [{ name: 'field' }]);

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
    const result = parseRecordsWithMetadata([[{ stringValue: '{"foo":1}' }]], [{ name: 'field' }]);

    deepEqual(result, [
      {
        field: '{"foo":1}'
      }
    ]);
  });

  it('assert :: prefer column label over name (alias)', () => {
    const result = parseRecordsWithMetadata([[{ longValue: 1 }]], [{ name: 'ranking', label: 'rank' }]);

    deepEqual(result, [
      {
        rank: 1
      }
    ]);
  });
});
