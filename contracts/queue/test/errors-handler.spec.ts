import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteSubscriptionError, IncompleteHandlerError, InvalidMessageTypeError } from '@ez4/queue/library';
import { registerTriggers } from '@ez4/queue/library';

import { parseFile } from './common/parser';

describe('queue handler metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete handler', () => {
    const [error1, error2, error3, error4, error5] = parseFile('incomplete-handler', 5);

    ok(error1 instanceof IncompleteHandlerError);
    deepEqual(error1.properties, ['request']);

    ok(error2 instanceof IncompleteSubscriptionError);
    deepEqual(error2.properties, ['handler']);

    ok(error3 instanceof InvalidMessageTypeError);
    deepEqual(error3.baseType, 'Queue.Message');

    ok(error4 instanceof IncompleteHandlerError);
    deepEqual(error4.properties, ['request']);

    ok(error5 instanceof IncompleteSubscriptionError);
    deepEqual(error5.properties, ['handler']);
  });
});
