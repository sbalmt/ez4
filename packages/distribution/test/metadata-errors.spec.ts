import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteOriginError,
  IncompleteServiceError,
  IncorrectOriginTypeError,
  InvalidOriginTypeError
} from '@ez4/distribution/library';

import { getReflection } from '@ez4/project/library';
import { registerTriggers, getCdnServices } from '@ez4/distribution/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getCdnServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe.only('distribution metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete distribution', () => {
    const [error1] = parseFile('incomplete-service', 1);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['defaultOrigin']);
  });

  it('assert :: incomplete origin', () => {
    const [error1, error2] = parseFile('incomplete-origin', 2);

    ok(error1 instanceof IncompleteOriginError);
    deepEqual(error1.properties, ['bucket']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['defaultOrigin']);
  });

  it('assert :: incorrect origin', () => {
    const [error1, error2] = parseFile('incorrect-origin', 2);

    ok(error1 instanceof IncorrectOriginTypeError);
    deepEqual(error1.baseType, 'Cdn.BucketOrigin');
    deepEqual(error1.originType, 'TestOrigin');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['defaultOrigin']);
  });

  it('assert :: invalid origin', () => {
    const [error1, error2] = parseFile('invalid-origin', 2);

    ok(error1 instanceof InvalidOriginTypeError);
    deepEqual(error1.baseType, 'Cdn.BucketOrigin');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['defaultOrigin']);
  });
});
