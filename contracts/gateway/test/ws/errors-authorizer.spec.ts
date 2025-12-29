import { ok, deepEqual, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  registerTriggers,
  IncorrectRequestTypeError,
  IncompleteAuthorizerHandlerError,
  InvalidRequestTypeError
} from '@ez4/gateway/library';

import { parseFile } from './common/parser';

describe('ws authorizer metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete authorizer handler', () => {
    const [error1] = parseFile('incomplete-authorizer', 1);

    ok(error1 instanceof IncompleteAuthorizerHandlerError);
    deepEqual(error1.properties, ['response']);
  });

  it('assert :: incorrect authorizer request', () => {
    const [error1] = parseFile('incorrect-authorizer', 1);

    ok(error1 instanceof IncorrectRequestTypeError);
    equal(error1.baseType, 'Ws.AuthRequest');
    equal(error1.modelType, 'AuthorizerRequest');
  });

  it('assert :: invalid authorizer request', () => {
    const [error1] = parseFile('invalid-authorizer', 1);

    ok(error1 instanceof InvalidRequestTypeError);
    equal(error1.baseType, 'Ws.AuthRequest');
  });
});
