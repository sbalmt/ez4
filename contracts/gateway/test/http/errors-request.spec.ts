import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncorrectRequestTypeError, InvalidRequestTypeError } from '@ez4/gateway/library';
import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('http request metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect request', () => {
    const [error1] = parseFile('incorrect-request', 1);

    ok(error1 instanceof IncorrectRequestTypeError);
    equal(error1.baseType, 'Http.Request');
    equal(error1.modelType, 'TestRequest');
  });

  it('assert :: invalid request (declaration)', () => {
    const [error1] = parseFile('invalid-request-class', 1);

    ok(error1 instanceof InvalidRequestTypeError);
    equal(error1.baseType, 'Http.Request');
  });

  it('assert :: invalid request (property)', () => {
    const [error1] = parseFile('invalid-request-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
