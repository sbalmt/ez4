import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  registerTriggers,
  IncompleteRouteError,
  IncompleteHandlerError,
  IncorrectResponseTypeError,
  InvalidResponseTypeError
} from '@ez4/gateway/library';

import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('http response metadata errors', () => {
  registerTriggers();

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

  it('assert :: invalid handler response (declaration)', () => {
    const [error1, error2, error3] = parseFile('invalid-response-class', 3);

    ok(error1 instanceof InvalidResponseTypeError);
    equal(error1.baseType, 'Http.Response');

    ok(error2 instanceof IncompleteHandlerError);
    deepEqual(error2.properties, ['response']);

    ok(error3 instanceof IncompleteRouteError);
    deepEqual(error3.properties, ['handler']);
  });

  it('assert :: invalid response (property)', () => {
    const [error1] = parseFile('invalid-response-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
