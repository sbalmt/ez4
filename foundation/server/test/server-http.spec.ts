import type { ServerInstance, HttpProviderRequest } from '@ez4/server';

import { deepEqual, equal } from 'node:assert/strict';
import { after, afterEach, before, describe, it, mock } from 'node:test';

import { ProviderType, registerProvider, startServer, unregisterProvider } from '@ez4/server';

const TEST_PROVIDER = 'test-http-handler';
const BASE_URL = 'http://127.0.0.1:3746';
const ORIGIN = 'http://localhost:3000';

describe('HTTP/1.1 request tests', async () => {
  let server: ServerInstance;

  before(async () => {
    server = await startServer({
      name: 'test-http-handler',
      host: '127.0.0.1',
      port: 3746
    });
  });

  after(async () => {
    await server.close();
  });

  afterEach(async () => {
    unregisterProvider(TEST_PROVIDER);
  });

  it('assert :: dispatches the complete request body and returns the provider response', async () => {
    const handler = mock.fn((incoming: HttpProviderRequest) => {
      deepEqual(incoming.body, Buffer.from('hello world'));

      equal(incoming.method, 'POST');
      equal(incoming.path, '/test');

      return {
        status: 200,
        body: 'response'
      };
    });

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: handler
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}/test`, {
      method: 'POST',
      body: 'hello world'
    });

    const result = await response.text();

    equal(response.status, 200);
    equal(result, 'response');
    equal(handler.mock.callCount(), 1);
  });

  it('assert :: serves ordinary HTTP requests', async () => {
    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: (incoming) => {
        equal(incoming.path, '/test');
        equal(incoming.method, 'GET');

        return {
          status: 200,
          body: 'HTTP response'
        };
      }
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}/test`);

    const result = await response.text();

    equal(response.status, 200);
    equal(result, 'HTTP response');
  });

  it('assert :: routes to the longest registered provider on segment boundaries', async () => {
    const nested = `${TEST_PROVIDER}/nested`;

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: ({ path }) => {
        return {
          status: 200,
          body: `parent:${path}`
        };
      }
    });

    registerProvider(nested, {
      type: ProviderType.Http,
      requestHandler: ({ path, query }) => {
        return {
          status: 200,
          body: `nested:${path}:${query?.value ?? ''}`
        };
      }
    });

    try {
      for (const [path, expected] of [
        [`/${nested}?value=example`, 'nested:/:example'],
        [`/${nested}/resource`, 'nested:/resource:'],
        [`/${nested}-other`, 'parent:/nested-other'],
        [`/${TEST_PROVIDER}/other`, 'parent:/other']
      ]) {
        const response = await fetch(`${BASE_URL}${path}`);

        equal(await response.text(), expected);
        equal(response.status, 200);
      }

      unregisterProvider(nested);

      const response = await fetch(`${BASE_URL}/${nested}`);

      equal(await response.text(), 'parent:/nested');
    } finally {
      unregisterProvider(nested);
    }
  });

  it('assert :: rejects a missing provider with a 404 without adding CORS headers', async () => {
    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`, {
      headers: {
        Origin: ORIGIN
      }
    });

    equal(response.status, 404);
    equal(response.headers.get('Content-Type'), 'application/json');
    equal(response.headers.get('Access-Control-Allow-Credentials'), null);
    equal(response.headers.get('Access-Control-Allow-Origin'), null);

    deepEqual(await response.json(), {
      type: 'error',
      message: 'Service emulator not found.'
    });
  });

  it('assert :: returns 422 for requests to a WebSocket provider', async () => {
    const connectHandler = mock.fn();
    const disconnectHandler = mock.fn();
    const messageHandler = mock.fn();

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler,
      disconnectHandler,
      messageHandler
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`, {
      headers: { Origin: ORIGIN }
    });

    equal(response.status, 422);
    equal(response.headers.get('Content-Type'), 'application/json');
    equal(response.headers.get('Access-Control-Allow-Origin'), null);

    deepEqual(await response.json(), {
      type: 'error',
      message: 'Provider cannot handle HTTP requests.'
    });

    equal(connectHandler.mock.callCount(), 0);
    equal(disconnectHandler.mock.callCount(), 0);
    equal(messageHandler.mock.callCount(), 0);
  });

  it('assert :: returns 500 when the provider throws', async () => {
    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      cors: true,
      requestHandler: () => {
        throw new Error('provider failed');
      }
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`, {
      headers: {
        Origin: ORIGIN
      }
    });

    const result = await response.json();

    equal(response.status, 500);
    equal(response.headers.get('Access-Control-Allow-Origin'), ORIGIN);

    deepEqual(result, {
      type: 'error',
      message: 'Error: provider failed'
    });
  });

  it('assert :: returns 500 when the provider rejects asynchronously', async () => {
    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      cors: true,
      requestHandler: async () => {
        throw new Error('async provider failed');
      }
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`, {
      headers: {
        Origin: ORIGIN
      }
    });

    const result = await response.json();

    equal(response.status, 500);
    equal(response.headers.get('Access-Control-Allow-Origin'), ORIGIN);

    deepEqual(result, {
      type: 'error',
      message: 'Error: async provider failed'
    });
  });

  it('assert :: replies 204 with CORS headers to OPTIONS without invoking the request handler', async () => {
    const requestHandler = mock.fn();

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      cors: true,
      requestHandler
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`, {
      method: 'OPTIONS',
      headers: {
        Origin: ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    equal(response.status, 204);

    equal(response.headers.get('Access-Control-Allow-Origin'), ORIGIN);
    equal(response.headers.get('Access-Control-Allow-Credentials'), 'true');
    equal(response.headers.get('Access-Control-Allow-Headers'), 'Content-Type');
    equal(response.headers.get('Access-Control-Allow-Methods'), 'POST');

    equal(requestHandler.mock.callCount(), 0);
  });

  it('assert :: forwards OPTIONS to the request handler when CORS is not configured', async () => {
    const requestHandler = mock.fn((incoming: HttpProviderRequest) => {
      equal(incoming.method, 'OPTIONS');
      equal(incoming.path, '/items');

      return {
        status: 200,
        body: 'custom options',
        headers: {
          Allow: 'GET, OPTIONS'
        }
      };
    });

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}/items`, {
      method: 'OPTIONS',
      headers: {
        Origin: ORIGIN,
        'Access-Control-Request-Method': 'POST'
      }
    });

    const result = await response.text();

    equal(response.status, 200);
    equal(response.headers.get('Allow'), 'GET, OPTIONS');
    equal(response.headers.get('Access-Control-Allow-Origin'), null);
    equal(result, 'custom options');

    equal(requestHandler.mock.callCount(), 1);
  });

  it('assert :: applies a configured CORS policy to preflight and actual responses', async () => {
    const requestHandler = mock.fn((request: HttpProviderRequest) => {
      return {
        status: 200,
        headers: {
          ...(request.headers?.origin === 'https://allowed.example' && {
            'Access-Control-Allow-Origin': 'https://provider.example',
            'Access-Control-Allow-Methods': 'DELETE'
          }),
          'X-Request-Id': 'request-id'
        }
      };
    });

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      cors: {
        allowOrigins: ['https://allowed.example'],
        allowMethods: ['GET'],
        allowHeaders: ['x-token'],
        exposeHeaders: ['X-Request-Id'],
        maxAge: 300
      },
      requestHandler
    });

    const preflight = await fetch(`${BASE_URL}/${TEST_PROVIDER}/items`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://allowed.example',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'X-Token'
      }
    });

    equal(preflight.status, 204);
    equal(preflight.headers.get('Access-Control-Allow-Origin'), 'https://allowed.example');
    equal(preflight.headers.get('Access-Control-Allow-Methods'), 'GET');
    equal(preflight.headers.get('Access-Control-Allow-Headers'), 'x-token');
    equal(preflight.headers.get('Access-Control-Expose-Headers'), 'X-Request-Id');
    equal(preflight.headers.get('Access-Control-Max-Age'), '300');
    equal(requestHandler.mock.callCount(), 0);

    const actual = await fetch(`${BASE_URL}/${TEST_PROVIDER}/items`, {
      headers: { Origin: 'https://allowed.example' }
    });

    equal(actual.headers.get('Access-Control-Allow-Origin'), 'https://allowed.example');
    equal(actual.headers.get('Access-Control-Allow-Methods'), null);
    equal(actual.headers.get('Access-Control-Expose-Headers'), 'X-Request-Id');

    const blocked = await fetch(`${BASE_URL}/${TEST_PROVIDER}/items`, {
      headers: { Origin: 'https://blocked.example' }
    });

    equal(blocked.headers.get('Access-Control-Allow-Origin'), null);

    const blockedPreflight = await fetch(`${BASE_URL}/${TEST_PROVIDER}/items`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://blocked.example',
        'Access-Control-Request-Method': 'GET'
      }
    });

    equal(blockedPreflight.status, 204);
    equal(blockedPreflight.headers.get('Access-Control-Allow-Origin'), null);
  });

  it('assert :: does not add CORS headers without an Origin', async () => {
    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      cors: true,
      requestHandler: () => ({
        status: 200
      })
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`);
    equal(response.headers.get('Access-Control-Allow-Origin'), null);
    equal(response.headers.get('Access-Control-Allow-Origin'), null);
  });

  it('assert :: applies default CORS instead of request handler CORS headers', async () => {
    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      cors: true,
      requestHandler: () => ({
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': 'https://allowed.example'
        }
      })
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`, {
      headers: {
        Origin: ORIGIN
      }
    });

    equal(response.status, 200);
    equal(response.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  });

  it('assert :: treats omitted CORS configuration as disabled', async () => {
    const requestHandler = mock.fn(() => ({ status: 204 }));

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`, {
      method: 'OPTIONS',
      headers: {
        Origin: ORIGIN,
        'Access-Control-Request-Method': 'POST'
      }
    });

    equal(response.status, 204);
    equal(response.headers.get('Access-Control-Allow-Origin'), null);
    equal(response.headers.get('Access-Control-Allow-Credentials'), null);
    equal(response.headers.get('Access-Control-Allow-Methods'), null);
    equal(response.headers.get('Access-Control-Allow-Headers'), null);
    equal(requestHandler.mock.callCount(), 1);
  });

  it('assert :: does not add CORS headers when provider CORS is explicitly disabled', async () => {
    const requestHandler = mock.fn(() => ({ status: 204 }));

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      cors: false,
      requestHandler
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`, {
      method: 'OPTIONS',
      headers: {
        Origin: ORIGIN,
        'Access-Control-Request-Method': 'POST'
      }
    });

    equal(response.status, 204);
    equal(response.headers.get('Access-Control-Allow-Origin'), null);
    equal(response.headers.get('Access-Control-Allow-Credentials'), null);
    equal(response.headers.get('Access-Control-Allow-Methods'), null);
    equal(response.headers.get('Access-Control-Allow-Headers'), null);
    equal(requestHandler.mock.callCount(), 1);
  });
});
