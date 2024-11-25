import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteHandlerError,
  IncompleteStreamError,
  IncorrectStreamTypeError,
  InvalidStreamTypeError
} from '@ez4/database/library';

import { registerTriggers } from '@ez4/database/library';
import { parseFile } from './common/parser.js';

describe.only('database stream errors', () => {
  registerTriggers();

  it('assert :: incomplete stream', () => {
    const [error1] = parseFile('incomplete-stream', 1);

    ok(error1 instanceof IncompleteStreamError);
    deepEqual(error1.properties, ['handler']);
  });

  it('assert :: incorrect stream', () => {
    const [error1] = parseFile('incorrect-stream', 1);

    ok(error1 instanceof IncorrectStreamTypeError);
    equal(error1.baseType, 'Database.Stream');
    equal(error1.streamType, 'TestStream');
  });

  it('assert :: invalid stream', () => {
    const [error1] = parseFile('invalid-stream', 1);

    ok(error1 instanceof InvalidStreamTypeError);
    equal(error1.baseType, 'Database.Stream');
  });

  it('assert :: incomplete stream handler', () => {
    const [error1, error2] = parseFile('incomplete-stream-handler', 2);

    ok(error1 instanceof IncompleteHandlerError);
    deepEqual(error1.properties, ['change']);

    ok(error2 instanceof IncompleteStreamError);
    deepEqual(error2.properties, ['handler']);
  });
});
