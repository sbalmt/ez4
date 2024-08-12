import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteHandlerError,
  IncompleteRouteError,
  IncompleteServiceError,
  IncorrectBodyTypeError,
  IncorrectParameterTypeError,
  IncorrectQueryTypeError,
  IncorrectRequestTypeError,
  IncorrectResponseTypeError,
  InvalidBodyTypeError,
  InvalidParameterTypeError,
  InvalidQueryTypeError,
  InvalidRequestTypeError,
  InvalidResponseTypeError
} from '@ez4/gateway/library';

import { getReflection } from '@ez4/project';
import { registerTriggers, getHttpServices } from '@ez4/gateway/library';

const parseFile = (fileName: string) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getHttpServices(reflection);

  return result.errors;
};

describe.only('http metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete service', () => {
    const errors = parseFile('incomplete-service');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['routes']);
  });

  it('assert :: incomplete service routes', () => {
    const errors = parseFile('incomplete-route');

    equal(errors.length, 2);

    const [error1, error2] = errors;

    ok(error1 instanceof IncompleteRouteError);
    deepEqual(error1.properties, ['path']);

    ok(error2 instanceof IncompleteRouteError);
    deepEqual(error2.properties, ['handler']);
  });

  it('assert :: incomplete route handler', () => {
    const errors = parseFile('incomplete-handler');

    equal(errors.length, 2);

    const [error1, error2] = errors;

    ok(error1 instanceof IncompleteHandlerError);
    deepEqual(error1.properties, ['response']);

    ok(error2 instanceof IncompleteRouteError);
    deepEqual(error2.properties, ['handler']);
  });

  it('assert :: incorrect handler response', () => {
    const errors = parseFile('incorrect-response');

    equal(errors.length, 3);

    const [error1, error2, error3] = errors;

    ok(error1 instanceof IncorrectResponseTypeError);
    equal(error1.baseType, 'Http.Response');
    equal(error1.responseType, 'TestResponse');

    ok(error2 instanceof IncompleteHandlerError);
    deepEqual(error2.properties, ['response']);

    ok(error3 instanceof IncompleteRouteError);
    deepEqual(error3.properties, ['handler']);
  });

  it('assert :: invalid handler response', () => {
    const errors = parseFile('invalid-response');

    equal(errors.length, 3);

    const [error1, error2, error3] = errors;

    ok(error1 instanceof InvalidResponseTypeError);
    equal(error1.baseType, 'Http.Response');

    ok(error2 instanceof IncompleteHandlerError);
    deepEqual(error2.properties, ['response']);

    ok(error3 instanceof IncompleteRouteError);
    deepEqual(error3.properties, ['handler']);
  });

  it('assert :: incorrect handler request', () => {
    const errors = parseFile('incorrect-request');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof IncorrectRequestTypeError);
    equal(error1.baseType, 'Http.Request');
    equal(error1.modelType, 'TestRequest');
  });

  it('assert :: invalid handler request', () => {
    const errors = parseFile('invalid-request');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof InvalidRequestTypeError);
    equal(error1.baseType, 'Http.Request');
  });

  it('assert :: incorrect query strings', () => {
    const errors = parseFile('incorrect-query');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof IncorrectQueryTypeError);
    equal(error1.baseType, 'Http.QueryStrings');
    equal(error1.queryType, 'TestQueryStrings');
  });

  it('assert :: invalid query strings', () => {
    const errors = parseFile('invalid-query');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof InvalidQueryTypeError);
    equal(error1.baseType, 'Http.QueryStrings');
  });

  it('assert :: incorrect path parameters', () => {
    const errors = parseFile('incorrect-parameter');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof IncorrectParameterTypeError);
    equal(error1.baseType, 'Http.PathParameters');
    equal(error1.modelType, 'TestParameters');
  });

  it('assert :: invalid path parameters', () => {
    const errors = parseFile('invalid-parameter');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof InvalidParameterTypeError);
    equal(error1.baseType, 'Http.PathParameters');
  });

  it('assert :: incorrect body', () => {
    const errors = parseFile('incorrect-body');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof IncorrectBodyTypeError);
    equal(error1.baseType, 'Http.JsonBody');
    equal(error1.modelType, 'TestBody');
  });

  it('assert :: invalid body', () => {
    const errors = parseFile('invalid-body');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof InvalidBodyTypeError);
    equal(error1.baseType, 'Http.JsonBody');
  });
});
