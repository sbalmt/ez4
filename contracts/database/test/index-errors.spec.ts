import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteTableError,
  IncorrectIndexesTypeError,
  InvalidIndexesTypeError,
  InvalidIndexTypeError,
  InvalidIndexReferenceError
} from '@ez4/database/library';

import { registerTriggers } from '@ez4/database/library';
import { parseFile } from './common/parser';

describe('database index errors', () => {
  registerTriggers();

  it('assert :: incorrect table indexes', () => {
    const [error1, error2] = parseFile('incorrect-indexes', 2);

    ok(error1 instanceof IncorrectIndexesTypeError);
    equal(error1.baseType, 'Database.Indexes');
    equal(error1.schemaType, 'TestIndexes');

    ok(error2 instanceof IncompleteTableError);
    deepEqual(error2.properties, ['indexes']);
  });

  it('assert :: invalid table indexes', () => {
    const [error1, error2] = parseFile('invalid-indexes', 2);

    ok(error1 instanceof InvalidIndexesTypeError);
    equal(error1.baseType, 'Database.Indexes');

    ok(error2 instanceof IncompleteTableError);
    deepEqual(error2.properties, ['indexes']);
  });

  it('assert :: invalid index type', () => {
    const [error1, error2] = parseFile('invalid-index-type', 2);

    ok(error1 instanceof InvalidIndexTypeError);
    equal(error1.indexName, 'id');

    ok(error2 instanceof IncompleteTableError);
    deepEqual(error2.properties, ['indexes']);
  });

  it('assert :: invalid index reference', () => {
    const [error1] = parseFile('invalid-index-reference', 1);

    ok(error1 instanceof InvalidIndexReferenceError);
    equal(error1.indexName, 'id');
  });
});
