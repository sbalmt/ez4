import { deepEqual, ok } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getSortedObject, sortObject } from '@ez4/utils';

describe('object sort utils', () => {
  const object = {
    bar: 1,
    foo: '2',
    baz: 3
  };

  it('assert :: sort object (generate)', () => {
    const input = { ...object };

    const output = getSortedObject(input);

    ok(output !== input);

    deepEqual(output, {
      bar: 1,
      baz: 3,
      foo: '2'
    });
  });

  it('assert :: sort object (in-place)', () => {
    const input = { ...object };

    const output = sortObject(input);

    ok(output === input);

    deepEqual(output, {
      bar: 1,
      baz: 3,
      foo: '2'
    });
  });
});
