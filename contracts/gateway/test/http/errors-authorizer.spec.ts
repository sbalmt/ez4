import { ok, deepEqual, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  registerTriggers,
  IncorrectRequestTypeError,
  IncompleteAuthorizerHandlerError,
  InvalidRequestTypeError
} from '@ez4/gateway/library';

import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('http authorizer metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete authorizer handler', () => {
    const [error1] = parseFile('incomplete-authorizer', 1);

    ok(error1 instanceof IncompleteAuthorizerHandlerError);
    deepEqual(error1.properties, ['response']);
  });

  it('assert :: incorrect authorizer request', () => {
    const [error1] = parseFile('incorrect-authorizer', 1);

    ok(error1 instanceof IncorrectRequestTypeError);
    equal(error1.baseType, 'Http.AuthRequest');
    equal(error1.modelType, 'TestAuthRequest');
  });

  it('assert :: invalid authorizer request (declaration)', () => {
    const [error1] = parseFile('invalid-authorizer-class', 1);

    ok(error1 instanceof InvalidRequestTypeError);
    equal(error1.baseType, 'Http.AuthRequest');
  });

  it('assert :: invalid authorizer request (property)', () => {
    const [error1] = parseFile('invalid-authorizer-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
