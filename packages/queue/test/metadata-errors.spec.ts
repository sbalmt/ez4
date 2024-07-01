import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteServiceError,
  IncompleteSubscriptionError,
  IncompleteHandlerError,
  IncorrectMessageTypeError,
  InvalidMessageTypeError
} from '@ez4/queue/library';

import { getReflection } from '@ez4/project';
import { registerTriggers, getQueueServices } from '@ez4/queue/library';

const parseFile = (fileName: string) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getQueueServices(reflection);

  return result.errors;
};

describe.only('queue metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete queue', () => {
    const errors = parseFile('incomplete-queue');

    equal(errors.length, 3);

    const [error1, error2, error3] = errors;

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['subscriptions']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['schema']);

    ok(error3 instanceof IncompleteServiceError);
    deepEqual(error3.properties, ['name']);
  });

  it('assert :: incomplete subscription', () => {
    const errors = parseFile('incomplete-subscription');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof IncompleteSubscriptionError);
    deepEqual(error1.properties, ['handler']);
  });

  it('assert :: incomplete handler', () => {
    const errors = parseFile('incomplete-handler');

    equal(errors.length, 2);

    const [error1, error2] = errors;

    ok(error1 instanceof IncompleteHandlerError);
    deepEqual(error1.properties, ['schema']);

    ok(error2 instanceof IncompleteSubscriptionError);
    deepEqual(error2.properties, ['handler']);
  });

  it('assert :: incorrect handler message', () => {
    const errors = parseFile('incorrect-message');

    equal(errors.length, 3);

    const [error1, error2, error3] = errors;

    ok(error1 instanceof IncorrectMessageTypeError);
    equal(error1.baseType, 'Queue.Message');
    equal(error1.messageType, 'TestMessage');

    ok(error2 instanceof IncompleteHandlerError);
    deepEqual(error2.properties, ['schema']);

    ok(error3 instanceof IncompleteSubscriptionError);
    deepEqual(error3.properties, ['handler']);
  });

  it('assert :: invalid handler message', () => {
    const errors = parseFile('invalid-message');

    equal(errors.length, 3);

    const [error1, error2, error3] = errors;

    ok(error1 instanceof InvalidMessageTypeError);
    equal(error1.baseType, 'Queue.Message');

    ok(error2 instanceof IncompleteHandlerError);
    deepEqual(error2.properties, ['schema']);

    ok(error3 instanceof IncompleteSubscriptionError);
    deepEqual(error3.properties, ['handler']);
  });
});
