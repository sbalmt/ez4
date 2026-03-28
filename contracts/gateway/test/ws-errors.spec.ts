import { describe, it } from 'node:test';
import { ok, equal, deepEqual } from 'node:assert/strict';

import { WsError, WsUnauthorizedError, WsForbiddenError, WsInternalServerError } from '@ez4/gateway';

import { getWsException } from '@ez4/gateway/utils';

describe('ws errors', () => {
  it('assert :: WsError base class', () => {
    const error = new WsError(4000, 'custom error');

    ok(error instanceof Error);
    equal(error.code, 4000);
    equal(error.message, 'custom error');
  });

  it('assert :: WsError with context', () => {
    const context = { field: 'token' };
    const error = new WsError(4000, 'custom error', context);

    equal(error.code, 4000);
    equal(error.message, 'custom error');
    deepEqual(error.context, context);
  });

  it('assert :: WsUnauthorizedError defaults', () => {
    const error = new WsUnauthorizedError();

    ok(error instanceof WsError);
    equal(error.code, 4001);
    equal(error.message, 'Unauthorized');
  });

  it('assert :: WsUnauthorizedError custom message', () => {
    const error = new WsUnauthorizedError('Token expired');

    equal(error.code, 4001);
    equal(error.message, 'Token expired');
  });

  it('assert :: WsForbiddenError defaults', () => {
    const error = new WsForbiddenError();

    ok(error instanceof WsError);
    equal(error.code, 4003);
    equal(error.message, 'Forbidden');
  });

  it('assert :: WsForbiddenError custom message', () => {
    const error = new WsForbiddenError('Insufficient permissions');

    equal(error.code, 4003);
    equal(error.message, 'Insufficient permissions');
  });

  it('assert :: WsInternalServerError defaults', () => {
    const error = new WsInternalServerError();

    ok(error instanceof WsError);
    equal(error.code, 4500);
    equal(error.message, 'Internal server error');
  });

  it('assert :: WsInternalServerError custom message', () => {
    const error = new WsInternalServerError('Something broke');

    equal(error.code, 4500);
    equal(error.message, 'Something broke');
  });
});

describe('getWsException', () => {
  it('assert :: returns WsUnauthorizedError for code 4001', () => {
    const error = getWsException(4001, 'bad token');

    ok(error instanceof WsUnauthorizedError);
    equal(error.code, 4001);
    equal(error.message, 'bad token');
  });

  it('assert :: returns WsForbiddenError for code 4003', () => {
    const error = getWsException(4003, 'no access');

    ok(error instanceof WsForbiddenError);
    equal(error.code, 4003);
    equal(error.message, 'no access');
  });

  it('assert :: returns WsInternalServerError for code 4500', () => {
    const error = getWsException(4500, 'server broke');

    ok(error instanceof WsInternalServerError);
    equal(error.code, 4500);
    equal(error.message, 'server broke');
  });

  it('assert :: returns base WsError for unknown code', () => {
    const error = getWsException(4999, 'custom');

    ok(error instanceof WsError);
    ok(!(error instanceof WsUnauthorizedError));
    ok(!(error instanceof WsForbiddenError));
    ok(!(error instanceof WsInternalServerError));
    equal(error.code, 4999);
    equal(error.message, 'custom');
  });

  it('assert :: passes context through', () => {
    const context = { detail: 'expired' };
    const error = getWsException(4001, 'bad token', context);

    deepEqual(error.context, context);
  });
});
