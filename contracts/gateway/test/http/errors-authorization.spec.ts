import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  registerTriggers,
  IncompleteAuthorizationError,
  IncorrectAuthorizationTypeError,
  InvalidAuthorizationTypeError
} from '@ez4/gateway/library';

import { InvalidServicePropertyError } from '@ez4/common/library';

import { parseFile } from './common/parser';

describe('http authorization metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete authorization', () => {
    const [error1] = parseFile('incomplete-authorization', 1);

    ok(error1 instanceof IncompleteAuthorizationError);
    deepEqual(error1.properties, ['value']);
  });

  it('assert :: incorrect authorization', () => {
    const [error1] = parseFile('incorrect-authorization', 1);

    ok(error1 instanceof IncorrectAuthorizationTypeError);
    equal(error1.baseType, 'Http.Authorization');
    equal(error1.modelType, 'TestAuthorization');
  });

  it('assert :: invalid authorization (declaration)', () => {
    const [error1] = parseFile('invalid-authorization-class', 1);

    ok(error1 instanceof InvalidAuthorizationTypeError);
    equal(error1.baseType, 'Http.Authorization');
  });

  it('assert :: invalid authorization (property)', () => {
    const [error1] = parseFile('invalid-authorization-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
