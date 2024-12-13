import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteCorsError,
  IncorrectCorsTypeError,
  InvalidCorsTypeError
} from '@ez4/storage/library';

import { getReflection } from '@ez4/project/library';
import { registerTriggers, getBucketServices } from '@ez4/storage/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getBucketServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe.only('storage metadata errors', () => {
  registerTriggers();

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
