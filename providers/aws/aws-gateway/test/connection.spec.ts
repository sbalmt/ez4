import { describe, it } from 'node:test';
import { deepEqual, equal } from 'node:assert/strict';

import { getConnectionEndpoint, getSuccessResponse } from '../lib/connection';

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
      getConnectionEndpoint('abc123.execute-api.us-east-1.amazonaws.com', 'prod', '/prod'),
      'https://abc123.execute-api.us-east-1.amazonaws.com/prod'
    );
  });

  it('assert :: preserves mapping path for custom domains', () => {
    equal(getConnectionEndpoint('ws.example.com', 'prod', '/tenant-a'), 'https://ws.example.com/tenant-a');
  });

  it('assert :: strips connect route from custom-domain paths', () => {
    equal(getConnectionEndpoint('ws.example.com', 'prod', '/tenant-a/$connect'), 'https://ws.example.com/tenant-a');
  });

  it('assert :: omits path for root custom domains', () => {
    equal(getConnectionEndpoint('ws.example.com', 'prod', '/'), 'https://ws.example.com');
  });
});
