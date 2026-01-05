import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  registerTriggers,
  IncorrectResponseTypeError,
  InvalidResponseTypeError,
  IncompleteHandlerError,
  IncompleteTargetError,
  IncompleteServiceError
} from '@ez4/gateway/library';

import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('ws response metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect response', () => {
    const [error1, error2, error3, error4] = parseFile('incorrect-response', 4);

    ok(error1 instanceof IncorrectResponseTypeError);
    equal(error1.baseType, 'Ws.Response');
    equal(error1.responseType, 'MessageResponse');

    ok(error2 instanceof IncompleteHandlerError);
    deepEqual(error2.properties, ['response']);

    ok(error3 instanceof IncompleteTargetError);
    deepEqual(error3.properties, ['handler']);

    ok(error4 instanceof IncompleteServiceError);
    deepEqual(error4.properties, ['message']);
  });

  it('assert :: invalid response (declaration)', () => {
    const [error1, error2, error3, error4] = parseFile('invalid-response-class', 4);

    ok(error1 instanceof InvalidResponseTypeError);
    equal(error1.baseType, 'Ws.Response');

    ok(error2 instanceof IncompleteHandlerError);
    deepEqual(error2.properties, ['response']);

    ok(error3 instanceof IncompleteTargetError);
    deepEqual(error3.properties, ['handler']);

    ok(error4 instanceof IncompleteServiceError);
    deepEqual(error4.properties, ['message']);
  });

  it('assert :: invalid response (property)', () => {
    const [error1] = parseFile('invalid-response-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
