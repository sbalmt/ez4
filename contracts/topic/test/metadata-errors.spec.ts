import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteServiceError,
  IncompleteSubscriptionError,
  IncompleteHandlerError,
  IncompleteFifoModeError,
  IncorrectSubscriptionTypeError,
  IncorrectFifoModePropertyError,
  IncorrectFifoModeTypeError,
  IncorrectMessageTypeError,
  InvalidSubscriptionTypeError,
  InvalidFifoModeTypeError,
  InvalidMessageTypeError
} from '@ez4/topic/library';

import { getReflection } from '@ez4/project/library';
import { registerTriggers, getTopicServices } from '@ez4/topic/library';
import { InvalidServicePropertyError } from '@ez4/common/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getTopicServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('topic metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete topic', () => {
    const [error1, error2] = parseFile('incomplete-service', 2);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['subscriptions']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['schema']);
  });

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

  it('assert :: incomplete fifo mode', () => {
    const [error1] = parseFile('incomplete-fifo', 1);

    ok(error1 instanceof IncompleteFifoModeError);
    deepEqual(error1.properties, ['groupId']);
  });

  it('assert :: incorrect fifo mode', () => {
    const [error1, error2] = parseFile('incorrect-fifo', 2);

    ok(error1 instanceof IncorrectFifoModeTypeError);
    equal(error1.baseType, 'Topic.FifoMode');
    equal(error1.modelType, 'TestFifoMode');

    ok(error2 instanceof IncorrectFifoModePropertyError);
    deepEqual(error2.properties, ['wrong']);
  });

  it('assert :: invalid fifo mode', () => {
    const [error1] = parseFile('invalid-fifo', 1);

    ok(error1 instanceof InvalidFifoModeTypeError);
    equal(error1.baseType, 'Topic.FifoMode');
  });
});
