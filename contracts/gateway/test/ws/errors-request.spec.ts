import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  registerTriggers,
  IncorrectRequestTypeError,
  InvalidRequestTypeError,
  IncompleteHandlerError,
  IncompleteTargetError,
  IncompleteServiceError
} from '@ez4/gateway/library';

import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('ws request metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect request', () => {
    const [error1, error2, error3, error4] = parseFile('incorrect-request', 4);

    ok(error1 instanceof IncorrectRequestTypeError);
    equal(error1.baseType, 'Ws.Request');
    equal(error1.requestType, 'MessageRequest');

    ok(error2 instanceof IncompleteHandlerError);
    deepEqual(error2.properties, ['request']);

    ok(error3 instanceof IncompleteTargetError);
    deepEqual(error3.properties, ['handler']);

    ok(error4 instanceof IncompleteServiceError);
    deepEqual(error4.properties, ['message']);
  });

  it('assert :: invalid request (declaration)', () => {
    const [error1, error2, error3, error4] = parseFile('invalid-request-class', 4);

    ok(error1 instanceof InvalidRequestTypeError);
    equal(error1.baseType, 'Ws.Request');

    ok(error2 instanceof IncompleteHandlerError);
    deepEqual(error2.properties, ['request']);

    ok(error3 instanceof IncompleteTargetError);
    deepEqual(error3.properties, ['handler']);

    ok(error4 instanceof IncompleteServiceError);
    deepEqual(error4.properties, ['message']);
  });

  it('assert :: invalid request (property)', () => {
    const [error1] = parseFile('invalid-request-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
