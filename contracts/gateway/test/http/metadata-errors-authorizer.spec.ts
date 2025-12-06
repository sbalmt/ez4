import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, IncorrectRequestTypeError, InvalidRequestTypeError } from '@ez4/gateway/library';

import { parseFile } from './utils/parser';

describe('http authorizer metadata errors', () => {
  registerTriggers();

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
});
