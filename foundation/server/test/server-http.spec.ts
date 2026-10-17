import type { ServerInstance, HttpProviderRequest } from '@ez4/server';

import { deepEqual, equal } from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';

import { ProviderType, registerProvider, startServer, unregisterProvider } from '@ez4/server';

const TEST_PROVIDER = 'test-http-handler';
const BASE_URL = 'http://127.0.0.1:3735';
const ORIGIN = 'http://localhost:3000';

describe('HTTP/1.1 request tests', async () => {
  let server: ServerInstance;

  beforeEach(async () => {
    server = await startServer({
      name: 'test-http-handler',
      host: '127.0.0.1',
      port: 3735
    });
  });

  afterEach(async () => {
    await server.close();
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

    equal(response.status, 200);
    equal(await response.text(), 'response');
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

    equal(response.status, 200);
    equal(await response.text(), 'HTTP response');
  });

  it('assert :: rejects a missing provider with a CORS-enabled 404', async () => {
    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`, {
      headers: { Origin: ORIGIN }
    });

    equal(response.status, 404);
    equal(response.headers.get('Content-Type'), 'application/json');
    deepEqual(await response.json(), { type: 'error', message: 'Service emulator not found.' });
    equal(response.headers.get('Access-Control-Allow-Credentials'), 'true');
    equal(response.headers.get('Access-Control-Allow-Origin'), ORIGIN);
    equal(response.headers.get('Vary'), 'Origin');
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
    deepEqual(await response.json(), { type: 'error', message: 'Provider cannot handle HTTP requests.' });
    equal(response.headers.get('Access-Control-Allow-Origin'), ORIGIN);
    equal(connectHandler.mock.callCount(), 0);
    equal(disconnectHandler.mock.callCount(), 0);
    equal(messageHandler.mock.callCount(), 0);
  });

  it('assert :: returns 500 when the provider throws', async () => {
    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: () => {
        throw new Error('provider failed');
      }
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`, {
      headers: { Origin: ORIGIN }
    });

    equal(response.status, 500);
    equal((await response.json()).message, 'Error: provider failed');
    equal(response.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  });

  it('assert :: returns 500 when the provider rejects asynchronously', async () => {
    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: async () => {
        throw new Error('async provider failed');
      }
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`, {
      headers: { Origin: ORIGIN }
    });

    equal(response.status, 500);
    equal((await response.json()).message, 'Error: async provider failed');
    equal(response.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  });

  it('assert :: sends default CORS headers for an OPTIONS request', async () => {
    const handler = mock.fn((incoming: HttpProviderRequest) => {
      equal(incoming.method, 'OPTIONS');
      return undefined;
    });

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: handler
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
    equal(response.headers.get('Access-Control-Allow-Methods'), 'POST');
    equal(response.headers.get('Access-Control-Allow-Headers'), 'Content-Type');
    equal(handler.mock.callCount(), 1);
  });

  it('assert :: uses the provider response for OPTIONS', async () => {
    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: () => ({
        status: 200,
        body: 'custom options',
        headers: { Allow: 'GET, OPTIONS' }
      })
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`, { method: 'OPTIONS' });

    equal(response.status, 200);
    equal(await response.text(), 'custom options');
    equal(response.headers.get('Allow'), 'GET, OPTIONS');
  });

  it('assert :: merges Vary without losing the provider value', async () => {
    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: () => ({
        status: 200,
        headers: { Vary: 'Accept-Encoding' }
      })
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`, {
      headers: { Origin: ORIGIN }
    });

    equal(response.headers.get('Vary'), 'Accept-Encoding, Origin');
  });

  it('assert :: does not duplicate Origin in Vary regardless of casing', async () => {
    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: () => ({
        status: 200,
        headers: { Vary: 'Accept-Encoding, oRiGiN' }
      })
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`, {
      headers: { Origin: ORIGIN }
    });

    equal(response.headers.get('Vary'), 'Accept-Encoding, oRiGiN');
  });

  it('assert :: preserves a wildcard Vary header', async () => {
    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: () => ({
        status: 200,
        headers: { Vary: '*' }
      })
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`, {
      headers: { Origin: ORIGIN }
    });

    equal(response.headers.get('Vary'), '*');
  });

  it('assert :: does not add CORS headers without an Origin', async () => {
    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: () => ({
        status: 200
      })
    });

    const response = await fetch(`${BASE_URL}/${TEST_PROVIDER}`);

    equal(response.headers.get('Access-Control-Allow-Origin'), null);
    equal(response.headers.get('Vary'), null);
  });
});
