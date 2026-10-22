import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getErrorResponse, getSuccessResponse } from '@ez4/server';

describe('HTTP response tests', () => {
  it('assert :: builds a success response with optional content type, body, and headers', () => {
    deepEqual(getSuccessResponse(200, { 'x-request-id': '123' }, 'application/json', '{"ok":true}'), {
      status: 200,
      headers: {
        'x-request-id': '123',
        'content-type': 'application/json'
      },
      body: '{"ok":true}'
    });
  });

  it('assert :: builds a success response without optional content', () => {
    deepEqual(getSuccessResponse(204), {
      status: 204,
      headers: {}
    });
  });

  it('assert :: builds a JSON error response', () => {
    deepEqual(getErrorResponse(400, { message: 'Invalid request' }), {
      status: 400,
      body: '{"message":"Invalid request"}',
      headers: {
        'content-type': 'application/json'
      }
    });
  });
});
