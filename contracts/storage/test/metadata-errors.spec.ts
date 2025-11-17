import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteCorsError,
  IncompleteEventError,
  IncorrectCorsTypeError,
  IncorrectEventTypeError,
  InvalidCorsTypeError,
  InvalidEventTypeError
} from '@ez4/storage/library';

import { registerTriggers, getBucketServices } from '@ez4/storage/library';
import { buildReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);
  const result = getBucketServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('storage metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete events', () => {
    const [error1] = parseFile('incomplete-events', 1);

    ok(error1 instanceof IncompleteEventError);
    deepEqual(error1.properties, ['handler']);
  });

  it('assert :: incorrect events', () => {
    const [error1] = parseFile('incorrect-events', 1);

    ok(error1 instanceof IncorrectEventTypeError);
    equal(error1.baseType, 'Bucket.Event');
    equal(error1.modelType, 'TestEvent');
  });

  it('assert :: invalid events', () => {
    const [error1] = parseFile('invalid-events', 1);

    ok(error1 instanceof InvalidEventTypeError);
    equal(error1.baseType, 'Bucket.Event');
  });

  it('assert :: incomplete cors', () => {
    const [error1] = parseFile('incomplete-cors', 1);

    ok(error1 instanceof IncompleteCorsError);
    deepEqual(error1.properties, ['allowOrigins']);
  });

  it('assert :: incorrect cors', () => {
    const [error1] = parseFile('incorrect-cors', 1);

    ok(error1 instanceof IncorrectCorsTypeError);
    equal(error1.baseType, 'Bucket.Cors');
    equal(error1.modelType, 'TestCors');
  });

  it('assert :: invalid cors', () => {
    const [error1] = parseFile('invalid-cors', 1);

    ok(error1 instanceof InvalidCorsTypeError);
    equal(error1.baseType, 'Bucket.Cors');
  });
});
