import type { Field, ColumnMetadata } from '@aws-sdk/client-rds-data';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mapResultRecords } from '@ez4/aws-aurora/client';

const read = (fields: Field[], columns: ColumnMetadata[]) => {
  return mapResultRecords([fields], columns)[0];
};

describe('aurora data read', () => {
  it('assert :: read string value', () => {
    deepEqual(read([{ stringValue: 'foo' }], [{ name: 'field' }]), {
      field: 'foo'
    });
  });

  it('assert :: read long value', () => {
    deepEqual(read([{ longValue: 123 }], [{ name: 'field' }]), {
      field: 123
    });
  });

  it('assert :: read double value', () => {
    deepEqual(read([{ doubleValue: 4.56 }], [{ name: 'field' }]), {
      field: 4.56
    });
  });

  it('assert :: read boolean value', () => {
    deepEqual(read([{ booleanValue: false }], [{ name: 'field' }]), {
      field: false
    });
  });

  it('assert :: read null value', () => {
    deepEqual(read([{ isNull: true }], [{ name: 'field' }]), {
      field: null
    });
  });

  it('assert :: read array value', () => {
    deepEqual(read([{ arrayValue: { stringValues: ['a', 'b'] } }], [{ name: 'field' }]), {
      field: ['a', 'b']
    });
  });

  it('assert :: keep json string raw (parsed later by the record parser)', () => {
    deepEqual(read([{ stringValue: '{"foo":1}' }], [{ name: 'field' }]), {
      field: '{"foo":1}'
    });
  });

  it('assert :: prefer column label over name (alias)', () => {
    deepEqual(read([{ longValue: 1 }], [{ name: 'ranking', label: 'rank' }]), {
      rank: 1
    });
  });

  it('assert :: map multiple columns', () => {
    deepEqual(
      read(
        [{ stringValue: '00000000-0000-0000-0000-000000000000' }, { longValue: 42 }, { booleanValue: true }],
        [{ name: 'id' }, { name: 'score' }, { name: 'active' }]
      ),
      {
        id: '00000000-0000-0000-0000-000000000000',
        score: 42,
        active: true
      }
    );
  });

  it('assert :: map multiple rows', () => {
    deepEqual(mapResultRecords([[{ stringValue: 'a' }], [{ stringValue: 'b' }]], [{ name: 'field' }]), [{ field: 'a' }, { field: 'b' }]);
  });
});
