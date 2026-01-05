import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteServiceError, IncorrectMessageTypeError, InvalidMessageTypeError } from '@ez4/topic/library';
import { registerTriggers } from '@ez4/topic/library';

import { parseFile } from './common/parser';

describe('topic message metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect message', () => {
    const [error1, error2] = parseFile('incorrect-message', 2);

    ok(error1 instanceof IncorrectMessageTypeError);
    equal(error1.baseType, 'Topic.Message');
    equal(error1.messageType, 'TestMessage');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['schema']);
  });

  it('assert :: invalid message', () => {
    const [error1, error2] = parseFile('invalid-message', 2);

    ok(error1 instanceof InvalidMessageTypeError);
    equal(error1.baseType, 'Topic.Message');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['schema']);
  });
});
