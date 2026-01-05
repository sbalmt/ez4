import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteSubscriptionError, IncompleteHandlerError } from '@ez4/topic/library';
import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/topic/library';

import { parseFile } from './common/parser';

describe('topic handler metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete handler', () => {
    const [error1, error2, error3, error4] = parseFile('incomplete-handler', 4);

    // Lambda subscription errors
    ok(error1 instanceof IncompleteHandlerError);
    deepEqual(error1.properties, ['request']);

    ok(error2 instanceof IncompleteSubscriptionError);
    deepEqual(error2.properties, ['handler']);

    // Queue subscription errors
    ok(error3 instanceof InvalidServicePropertyError);
    deepEqual(error3.propertyName, 'handler');

    ok(error4 instanceof IncompleteSubscriptionError);
    deepEqual(error4.properties, ['service']);
  });
});
