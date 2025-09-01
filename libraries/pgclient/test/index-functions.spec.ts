import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Index } from '@ez4/database';

import { tryExtractConflictIndex } from '../src/utils/indexes';

describe('index functions', () => {
  const indexes = [
    {
      columns: ['primary'],
      name: 'primary_px',
      type: Index.Primary
    },
    {
      columns: ['unique'],
      name: 'unique_uk',
      type: Index.Unique
    },
    {
      columns: ['primary_1', 'primary_2'],
      name: 'compound_primary_pk',
      type: Index.Primary
    },
    {
      columns: ['unique_1', 'unique_2'],
      name: 'compound_unique_pk',
      type: Index.Unique
    },
    {
      columns: ['secondary'],
      name: 'secondary_sk',
      type: Index.Secondary
    }
  ];

  it('assert :: extract primary index', () => {
    const index = tryExtractConflictIndex(indexes, {
      primary: 'foo',
      another: 'bar',
      secondary: true
    });

    deepEqual(index, indexes[0]);
  });

  it('assert :: extract unique index', () => {
    const index = tryExtractConflictIndex(indexes, {
      another: 'foo',
      secondary: false,
      unique: 'bar'
    });

    deepEqual(index, indexes[1]);
  });

  it('assert :: extract primary compound index', () => {
    const index = tryExtractConflictIndex(indexes, {
      another: 'foo',
      primary_2: 'bar',
      secondary: true,
      primary_1: 123
    });

    deepEqual(index, indexes[2]);
  });

  it('assert :: extract unique compound index', () => {
    const index = tryExtractConflictIndex(indexes, {
      another: 'foo',
      secondary: false,
      unique_2: 123,
      unique_1: 'bar'
    });

    deepEqual(index, indexes[3]);
  });

  it('assert :: extract incomplete primary index (undefined expected)', () => {
    const index = tryExtractConflictIndex(indexes, {
      another: 'foo',
      primary_2: true
    });

    deepEqual(index, undefined);
  });

  it('assert :: extract incomplete unique index (undefined expected)', () => {
    const index = tryExtractConflictIndex(indexes, {
      another: 'foo',
      unique_1: false
    });

    deepEqual(index, undefined);
  });

  it('assert :: extract secondary index (undefined expected)', () => {
    const index = tryExtractConflictIndex(indexes, {
      another: 'foo',
      secondary: true
    });

    deepEqual(index, undefined);
  });
});
