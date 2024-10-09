import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteServiceError,
  IncompleteCorsError,
  IncompleteRouteError,
  IncompleteHandlerError,
  IncorrectCorsTypeError,
  IncorrectHeadersTypeError,
  IncorrectIdentityTypeError,
  IncorrectParameterTypeError,
  IncorrectQueryTypeError,
  IncorrectBodyTypeError,
  IncorrectRequestTypeError,
  IncorrectResponseTypeError,
  InvalidCorsTypeError,
  InvalidHeadersTypeError,
  InvalidIdentityTypeError,
  InvalidParameterTypeError,
  InvalidQueryTypeError,
  InvalidBodyTypeError,
  InvalidRequestTypeError,
  InvalidResponseTypeError
} from '@ez4/gateway/library';

import { getReflection } from '@ez4/project/library';
import { registerTriggers, getHttpServices } from '@ez4/gateway/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getHttpServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe.only('http metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete service', () => {
    const [error1] = parseFile('incomplete-service', 1);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['routes']);
  });

  it('assert :: incomplete service routes', () => {
    const [error1, error2] = parseFile('incomplete-route', 2);

    ok(error1 instanceof IncompleteRouteError);
    deepEqual(error1.properties, ['path']);

    ok(error2 instanceof IncompleteRouteError);
    deepEqual(error2.properties, ['handler']);
  });

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

  it('assert :: incorrect authorizer request', () => {
    const [error1] = parseFile('incorrect-authorizer', 1);

    ok(error1 instanceof IncorrectRequestTypeError);
    equal(error1.baseType, 'Http.AuthRequest');
    equal(error1.modelType, 'TestAuthRequest');
  });

  it('assert :: invalid authorizer request', () => {
    const [error1] = parseFile('invalid-authorizer', 1);

    ok(error1 instanceof InvalidRequestTypeError);
    equal(error1.baseType, 'Http.AuthRequest');
  });

  it('assert :: incorrect headers', () => {
    const [error1] = parseFile('incorrect-headers', 1);

    ok(error1 instanceof IncorrectHeadersTypeError);
    equal(error1.baseType, 'Http.Headers');
    equal(error1.headersType, 'TestHeaders');
  });

  it('assert :: invalid headers', () => {
    const [error1] = parseFile('invalid-headers', 1);

    ok(error1 instanceof InvalidHeadersTypeError);
    equal(error1.baseType, 'Http.Headers');
  });

  it('assert :: incorrect identity', () => {
    const [error1] = parseFile('incorrect-identity', 1);

    ok(error1 instanceof IncorrectIdentityTypeError);
    equal(error1.baseType, 'Http.Identity');
    equal(error1.identityType, 'TestIdentity');
  });

  it('assert :: invalid identity', () => {
    const [error1] = parseFile('invalid-identity', 1);

    ok(error1 instanceof InvalidIdentityTypeError);
    equal(error1.baseType, 'Http.Identity');
  });

  it('assert :: incorrect path parameters', () => {
    const [error1] = parseFile('incorrect-parameter', 1);

    ok(error1 instanceof IncorrectParameterTypeError);
    equal(error1.baseType, 'Http.PathParameters');
    equal(error1.modelType, 'TestParameters');
  });

  it('assert :: invalid path parameters', () => {
    const [error1] = parseFile('invalid-parameter', 1);

    ok(error1 instanceof InvalidParameterTypeError);
    equal(error1.baseType, 'Http.PathParameters');
  });

  it('assert :: incorrect query strings', () => {
    const [error1] = parseFile('incorrect-query', 1);

    ok(error1 instanceof IncorrectQueryTypeError);
    equal(error1.baseType, 'Http.QueryStrings');
    equal(error1.queryType, 'TestQueryStrings');
  });

  it('assert :: invalid query strings', () => {
    const [error1] = parseFile('invalid-query', 1);

    ok(error1 instanceof InvalidQueryTypeError);
    equal(error1.baseType, 'Http.QueryStrings');
  });

  it('assert :: incorrect body', () => {
    const [error1] = parseFile('incorrect-body', 1);

    ok(error1 instanceof IncorrectBodyTypeError);
    equal(error1.baseType, 'Http.JsonBody');
    equal(error1.modelType, 'TestBody');
  });

  it('assert :: invalid body', () => {
    const [error1] = parseFile('invalid-body', 1);

    ok(error1 instanceof InvalidBodyTypeError);
    equal(error1.baseType, 'Http.JsonBody');
  });

  it('assert :: incomplete cors', () => {
    const [error1] = parseFile('incomplete-cors', 1);

    ok(error1 instanceof IncompleteCorsError);
    deepEqual(error1.properties, ['allowOrigins']);
  });

  it('assert :: incorrect cors', () => {
    const [error1] = parseFile('incorrect-cors', 1);

    ok(error1 instanceof IncorrectCorsTypeError);
    equal(error1.baseType, 'Http.Cors');
    equal(error1.modelType, 'TestCors');
  });

  it('assert :: invalid cors', () => {
    const [error1] = parseFile('invalid-cors', 1);

    ok(error1 instanceof InvalidCorsTypeError);
    equal(error1.baseType, 'Http.Cors');
  });
});
