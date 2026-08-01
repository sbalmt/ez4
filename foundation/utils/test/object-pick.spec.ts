import { describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';

import { pickObject } from '@ez4/utils';

describe('object pick utils', () => {
  const source = {
    foo: 'abc',
    bar: 123,
    baz: true
  };

  it('assert :: pick properties', () => {
    const copy = pickObject(source, ['foo', 'bar']);

    deepEqual(copy, {
      foo: 'abc',
      bar: 123
    });
  });
});
