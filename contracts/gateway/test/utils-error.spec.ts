import { deepEqual, equal, ok } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getHttpException, getJsonError } from '@ez4/gateway/utils';

import {
  HttpBadRequestError,
  HttpConflictError,
  HttpError,
  HttpForbiddenError,
  HttpNotFoundError,
  HttpUnauthorizedError,
  HttpUnprocessableEntityError,
  HttpUnsupportedMediaTypeError
} from '@ez4/gateway';

describe('http error utils', () => {
  it('assert :: map bad request', () => {
    const error = getHttpException(400, 'Bad request', { reason: 'test' });

    ok(error instanceof HttpBadRequestError);

    equal(error.status, 400);
    equal(error.message, 'Bad request');

    deepEqual(error.context, { reason: 'test' });
  });

  it('assert :: map unauthorized', () => {
    const error = getHttpException(401, 'Unauthorized', { reason: 'test' });

    ok(error instanceof HttpUnauthorizedError);

    equal(error.status, 401);
    equal(error.message, 'Unauthorized');

    deepEqual(error.context, { reason: 'test' });
  });

  it('assert :: map forbidden', () => {
    const error = getHttpException(403, 'Forbidden', { reason: 'test' });

    ok(error instanceof HttpForbiddenError);

    equal(error.status, 403);
    equal(error.message, 'Forbidden');

    deepEqual(error.context, { reason: 'test' });
  });

  it('assert :: map not found', () => {
    const error = getHttpException(404, 'Not found', { reason: 'test' });

    ok(error instanceof HttpNotFoundError);

    equal(error.status, 404);
    equal(error.message, 'Not found');

    deepEqual(error.context, { reason: 'test' });
  });

  it('assert :: map conflict', () => {
    const error = getHttpException(409, 'Conflict', { reason: 'test' });

    ok(error instanceof HttpConflictError);

    equal(error.status, 409);
    equal(error.message, 'Conflict');

    deepEqual(error.context, { reason: 'test' });
  });

  it('assert :: map unsupported media type', () => {
    const error = getHttpException(415, 'Unsupported media type', { reason: 'test' });

    ok(error instanceof HttpUnsupportedMediaTypeError);

    equal(error.status, 415);
    equal(error.message, 'Unsupported media type');

    deepEqual(error.context, { reason: 'test' });
  });

  it('assert :: map unprocessable entity', () => {
    const error = getHttpException(422, 'Unprocessable entity', { reason: 'test' });

    ok(error instanceof HttpUnprocessableEntityError);

    equal(error.status, 422);
    equal(error.message, 'Unprocessable entity');

    deepEqual(error.context, { reason: 'test' });
  });

  it('assert :: map unsupported status', () => {
    const error = getHttpException(500, 'Internal server error', { reason: 'test' });

    ok(error instanceof HttpError);

    equal(error.constructor, HttpError);
    equal(error.status, 500);
    equal(error.message, 'Internal server error');

    deepEqual(error.context, { reason: 'test' });
  });

  it('assert :: format error (with context)', () => {
    const error = getHttpException(400, 'Bad request', { reason: 'test' });

    deepEqual(getJsonError(error), {
      status: 400,
      body: {
        type: 'error',
        message: 'Bad request',
        context: {
          reason: 'test'
        }
      }
    });
  });

  it('assert :: format error (without context)', () => {
    const error = getHttpException(400, 'Bad request');

    deepEqual(getJsonError(error), {
      status: 400,
      body: {
        type: 'error',
        message: 'Bad request',
        context: undefined
      }
    });
  });
});
