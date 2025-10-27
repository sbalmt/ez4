import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteRouteError,
  IncompleteHandlerError,
  IncorrectRequestTypeError,
  IncorrectResponseTypeError,
  InvalidRequestTypeError,
  InvalidResponseTypeError
} from '@ez4/gateway/library';

import { registerTriggers, getHttpServices } from '@ez4/gateway/library';
import { getReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getHttpServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('http handler metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete route handler', () => {
    const [error1, error2] = parseFile('incomplete-handler', 2);

    ok(error1 instanceof IncompleteHandlerError);
    deepEqual(error1.properties, ['response']);

    ok(error2 instanceof IncompleteRouteError);
    deepEqual(error2.properties, ['handler']);
  });

  it('assert :: incorrect handler response', () => {
    const [error1, error2, error3] = parseFile('incorrect-response', 3);

    ok(error1 instanceof IncorrectResponseTypeError);
    equal(error1.baseType, 'Http.Response');
    equal(error1.responseType, 'TestResponse');

    ok(error2 instanceof IncompleteHandlerError);
    deepEqual(error2.properties, ['response']);

    ok(error3 instanceof IncompleteRouteError);
    deepEqual(error3.properties, ['handler']);
  });

  it('assert :: invalid handler response', () => {
    const [error1, error2, error3] = parseFile('invalid-response', 3);

    ok(error1 instanceof InvalidResponseTypeError);
    equal(error1.baseType, 'Http.Response');

    ok(error2 instanceof IncompleteHandlerError);
    deepEqual(error2.properties, ['response']);

    ok(error3 instanceof IncompleteRouteError);
    deepEqual(error3.properties, ['handler']);
  });

  it('assert :: incorrect handler request', () => {
    const [error1] = parseFile('incorrect-request', 1);

    ok(error1 instanceof IncorrectRequestTypeError);
    equal(error1.baseType, 'Http.Request');
    equal(error1.modelType, 'TestRequest');
  });

  it('assert :: invalid handler request', () => {
    const [error1] = parseFile('invalid-request', 1);

    ok(error1 instanceof InvalidRequestTypeError);
    equal(error1.baseType, 'Http.Request');
  });
});
