import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteSubscriptionError, IncorrectSubscriptionTypeError, InvalidSubscriptionTypeError } from '@ez4/queue/library';
import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/queue/library';

import { parseFile } from './common/parser';

describe('queue subscription metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete subscription', () => {
    const [error1] = parseFile('incomplete-subscription', 1);

    ok(error1 instanceof IncompleteSubscriptionError);
    deepEqual(error1.properties, ['handler']);
  });

  it('assert :: incorrect subscription', () => {
    const [error1] = parseFile('incorrect-subscription', 1);

    ok(error1 instanceof IncorrectSubscriptionTypeError);
    equal(error1.baseType, 'Queue.Subscription');
    equal(error1.subscriptionType, 'TestSubscription');
  });

  it('assert :: invalid subscription (declaration)', () => {
    const [error1] = parseFile('invalid-subscription-class', 1);

    ok(error1 instanceof InvalidSubscriptionTypeError);
    equal(error1.baseType, 'Queue.Subscription');
  });

  it('assert :: invalid subscription (property)', () => {
    const [error1] = parseFile('invalid-subscription-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
