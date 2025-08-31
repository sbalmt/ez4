import { ok, deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { deepCompare, deepEqual as deepEquals } from '@ez4/utils';

describe('array utils', () => {
  it('assert :: deep equals', () => {
    const target = [[123], 'abc', { field: true }];
    const source = [[123], 'abc', { field: true }];

    const result = deepEquals(target, source);

    ok(result);
  });

  it('assert :: deep compare', () => {
    const target = [123, ['foo', false], {}];

    const source = [
      undefined, // Create
      [
        'foo',
        true // Update
      ],
      {},
      'bar' // Remove
    ];

    const changes = deepCompare(target, source);

    deepEqual(changes, {
      counts: 3,
      create: {
        '0': 123
      },
      update: {
        '1': {
          counts: 1,
          update: {
            '1': false
          }
        }
      },
      remove: {
        '3': 'bar'
      }
    });
  });
});
