import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteServiceError, IncorrectEventTypeError, InvalidEventTypeError } from '@ez4/topic/library';
import { registerTriggers } from '@ez4/topic/library';

import { parseFile } from './common/parser';

describe('topic event metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect event', () => {
    const [error1, error2] = parseFile('incorrect-event', 2);

    ok(error1 instanceof IncorrectEventTypeError);
    equal(error1.baseType, 'Topic.Event');
    equal(error1.eventType, 'TestEvent');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['schema']);
  });

  it('assert :: invalid event', () => {
    const [error1, error2] = parseFile('invalid-event', 2);

    ok(error1 instanceof InvalidEventTypeError);
    equal(error1.baseType, 'Topic.Event');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['schema']);
  });
});
