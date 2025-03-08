import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteServiceError,
  IncorrectMessageTypeError,
  InvalidMessageTypeError,
  IncompleteSubscriptionError,
  IncorrectSubscriptionTypeError,
  InvalidSubscriptionTypeError,
  IncompleteHandlerError,
  IncorrectFifoModeTypeError,
  IncorrectFifoModePropertyError,
  InvalidFifoModeTypeError,
  IncompleteFifoModeError
} from '@ez4/queue/library';

import { getReflection } from '@ez4/project/library';
import { registerTriggers, getQueueServices } from '@ez4/queue/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getQueueServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe.only('queue metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete queue', () => {
    const [error1, error2] = parseFile('incomplete-service', 2);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['subscriptions']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['schema']);
  });

  it('assert :: incorrect message', () => {
    const [error1, error2] = parseFile('incorrect-message', 2);

    ok(error1 instanceof IncorrectMessageTypeError);
    equal(error1.baseType, 'Queue.Message');
    equal(error1.messageType, 'TestMessage');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['schema']);
  });

  it('assert :: invalid message', () => {
    const [error1, error2] = parseFile('invalid-message', 2);

    ok(error1 instanceof InvalidMessageTypeError);
    equal(error1.baseType, 'Queue.Message');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['schema']);
  });

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

  it('assert :: invalid subscription', () => {
    const [error1] = parseFile('invalid-subscription', 1);

    ok(error1 instanceof InvalidSubscriptionTypeError);
    equal(error1.baseType, 'Queue.Subscription');
  });

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

  it('assert :: incomplete fifo mode', () => {
    const [error1] = parseFile('incomplete-fifo', 1);

    ok(error1 instanceof IncompleteFifoModeError);
    deepEqual(error1.properties, ['groupId']);
  });

  it('assert :: incorrect fifo mode', () => {
    const [error1, error2] = parseFile('incorrect-fifo', 2);

    ok(error1 instanceof IncorrectFifoModeTypeError);
    equal(error1.baseType, 'Queue.FifoMode');
    equal(error1.modelType, 'TestFifoMode');

    ok(error2 instanceof IncorrectFifoModePropertyError);
    deepEqual(error2.properties, ['wrong']);
  });

  it('assert :: invalid fifo mode', () => {
    const [error1] = parseFile('invalid-fifo', 1);

    ok(error1 instanceof InvalidFifoModeTypeError);
    equal(error1.baseType, 'Queue.FifoMode');
  });
});
