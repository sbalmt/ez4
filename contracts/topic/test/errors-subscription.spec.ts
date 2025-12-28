import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteSubscriptionError, IncorrectSubscriptionTypeError, InvalidSubscriptionTypeError } from '@ez4/topic/library';
import { registerTriggers } from '@ez4/topic/library';
import { parseFile } from './common/parser';

describe('topic subscription metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete subscription', () => {
    const [error1, error2] = parseFile('incomplete-subscription', 2);

    ok(error1 instanceof IncompleteSubscriptionError);
    deepEqual(error1.properties, ['handler']);

    ok(error2 instanceof IncompleteSubscriptionError);
    deepEqual(error2.properties, ['service']);
  });

  it('assert :: incorrect subscription', () => {
    const [error1] = parseFile('incorrect-subscription', 1);

    ok(error1 instanceof IncorrectSubscriptionTypeError);
    equal(error1.baseType, 'Topic.Subscription');
    equal(error1.subscriptionType, 'TestSubscription');
  });

  it('assert :: invalid subscription', () => {
    const [error1] = parseFile('invalid-subscription', 1);

    ok(error1 instanceof InvalidSubscriptionTypeError);
    equal(error1.baseType, 'Topic.Subscription');
  });
});
