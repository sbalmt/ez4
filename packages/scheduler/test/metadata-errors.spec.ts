import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteHandlerError,
  IncompleteServiceError,
  IncompleteTargetError,
  IncorrectEventTypeError,
  IncorrectTargetTypeError,
  IncorrectHandlerError,
  InvalidEventTypeError,
  InvalidTargetTypeError,
  IncorrectServiceError
} from '@ez4/scheduler/library';

import { getReflection } from '@ez4/project/library';
import { registerTriggers, getCronServices } from '@ez4/scheduler/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getCronServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe.only('scheduler metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete scheduler', () => {
    const [error1, error2, error3] = parseFile('incomplete-service', 3);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['target']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['expression']);

    ok(error3 instanceof IncompleteServiceError);
    deepEqual(error3.properties, ['schema']);
  });

  it('assert :: incorrect scheduler', () => {
    const [error1] = parseFile('incorrect-service', 1);

    ok(error1 instanceof IncorrectServiceError);
    deepEqual(error1.properties, ['disabled', 'timezone', 'startDate', 'endDate']);
  });

  it('assert :: incomplete target', () => {
    const [error1, error2] = parseFile('incomplete-target', 2);

    ok(error1 instanceof IncompleteTargetError);
    deepEqual(error1.properties, ['handler']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['target']);
  });

  it('assert :: incorrect target', () => {
    const [error1, error2] = parseFile('incorrect-target', 2);

    ok(error1 instanceof IncorrectTargetTypeError);
    deepEqual(error1.baseType, 'Cron.Target');
    deepEqual(error1.targetType, 'TestTarget');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['target']);
  });

  it('assert :: invalid target', () => {
    const [error1, error2] = parseFile('invalid-target', 2);

    ok(error1 instanceof InvalidTargetTypeError);
    deepEqual(error1.baseType, 'Cron.Target');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['target']);
  });

  it('assert :: incorrect event', () => {
    const [error1, error2] = parseFile('incorrect-event', 2);

    ok(error1 instanceof IncorrectEventTypeError);
    equal(error1.baseType, 'Cron.Event');
    equal(error1.eventType, 'TestEvent');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['schema']);
  });

  it('assert :: invalid event', () => {
    const [error1, error2] = parseFile('invalid-event', 2);

    ok(error1 instanceof InvalidEventTypeError);
    equal(error1.baseType, 'Cron.Event');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['schema']);
  });

  it('assert :: incomplete handler', () => {
    const [error1, error2, error3, error4] = parseFile('incomplete-handler', 4);

    ok(error1 instanceof InvalidEventTypeError);
    deepEqual(error1.baseType, 'Cron.Event');

    ok(error2 instanceof IncompleteHandlerError);
    deepEqual(error2.properties, ['_request']);

    ok(error3 instanceof IncompleteTargetError);
    deepEqual(error3.properties, ['handler']);

    ok(error4 instanceof IncompleteServiceError);
    deepEqual(error4.properties, ['target']);
  });

  it('assert :: incorrect handler', () => {
    const [error1] = parseFile('incorrect-handler', 1);

    ok(error1 instanceof IncorrectHandlerError);
    deepEqual(error1.properties, ['_request']);
  });
});
