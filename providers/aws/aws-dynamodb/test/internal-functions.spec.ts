import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { findBestSecondaryIndex } from '../src/client/common/indexes';

describe('dynamodb internal functions', () => {
  it('assert :: find best secondary index', () => {
    const indexes = [['foo', 'bar'], ['foo'], ['bar']];

    equal(findBestSecondaryIndex(indexes, { foo: 'foo' }), 'foo-index');
    equal(findBestSecondaryIndex(indexes, { foo: 'foo', bar: 'bar' }), 'foo-bar-index');
    equal(findBestSecondaryIndex(indexes, { bar: 'bar' }), 'bar-index');
  });
});
