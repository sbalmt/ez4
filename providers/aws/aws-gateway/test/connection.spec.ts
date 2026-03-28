import { describe, it } from 'node:test';
import { deepEqual, equal } from 'node:assert/strict';

import { getConnectionEndpoint, getSuccessResponse } from '../lib/connection.ts';

describe('gateway connection', () => {
  it('assert :: returns success response for forwarded auth errors', () => {
    deepEqual(getSuccessResponse('trace-id'), {
      statusCode: 204,
      headers: {
        ['x-trace-id']: 'trace-id'
      }
    });
  });

  it('assert :: includes stage for execute-api domains', () => {
    equal(
      getConnectionEndpoint('abc123.execute-api.us-east-1.amazonaws.com', 'prod'),
      'https://abc123.execute-api.us-east-1.amazonaws.com/prod'
    );
  });

  it('assert :: omits stage for custom domains', () => {
    equal(getConnectionEndpoint('ws.example.com', 'prod'), 'https://ws.example.com');
  });
});
