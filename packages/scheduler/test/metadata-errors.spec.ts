import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteServiceError,
  IncompleteTargetError,
  IncorrectTargetTypeError,
  InvalidTargetTypeError
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
    const [error1, error2] = parseFile('incomplete-service', 2);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['target']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['expression']);
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
});
