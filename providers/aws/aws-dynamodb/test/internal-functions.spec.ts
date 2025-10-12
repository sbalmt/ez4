import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { findBestSecondaryIndex } from '../src/client/common/indexes';

describe('dynamodb internal functions', () => {
  const indexes = [['primary', 'range'], ['secondary1', 'range1'], ['secondary2'], ['secondary3']];

  it('assert :: keep using primary index', () => {
    equal(findBestSecondaryIndex(indexes, { primary1: 'foo', range1: 'bar' }), undefined);
    equal(findBestSecondaryIndex(indexes, { primary1: 'foo' }), undefined);
  });

  it('assert :: find best secondary index (compound)', () => {
    equal(findBestSecondaryIndex(indexes, { secondary1: 'foo', range1: 'bar' }), 'secondary1-range1-index');
    equal(findBestSecondaryIndex(indexes, { secondary1: 'foo' }), 'secondary1-range1-index');
  });

  it('assert :: find best secondary index', () => {
    equal(findBestSecondaryIndex(indexes, { secondary2: 'foo' }), 'secondary2-index');
    equal(findBestSecondaryIndex(indexes, { secondary3: 'foo' }), 'secondary3-index');
  });
});
