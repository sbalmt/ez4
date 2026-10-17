import type { HttpProviderRequest, HttpProviderResponse } from '@ez4/server';

import { equal, rejects, throws } from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';

import {
  DuplicateProviderError,
  IncompatibleProviderError,
  MissingProviderError,
  ProviderType,
  notifyHttpRequest,
  providerRegistered,
  registerProvider,
  unregisterProvider
} from '@ez4/server';

const TEST_PROVIDER = 'test-http-provider';

const request: HttpProviderRequest = {
  path: '/test',
  method: 'POST',
  body: Buffer.from('{"value":"test"}'),
  headers: {
    'content-type': 'application/json'
  },
  query: {
    value: 'test'
  }
};

describe('HTTP provider tests', () => {
  afterEach(() => {
    unregisterProvider(TEST_PROVIDER);
  });

  it('assert :: unregisters a provider and allows re-registration', () => {
    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: () => ({
        status: 204
      })
    });

    equal(unregisterProvider(TEST_PROVIDER), true);
    equal(providerRegistered(TEST_PROVIDER), false);

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler: () => {},
      disconnectHandler: () => {},
      messageHandler: () => {}
    });

    equal(providerRegistered(TEST_PROVIDER), true);
  });

  it('assert :: rejects duplicate registration without replacing the provider', async () => {
    const response: HttpProviderResponse = { status: 200, body: 'original' };

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: () => response
    });

    throws(
      () =>
        registerProvider(TEST_PROVIDER, {
          type: ProviderType.Http,
          requestHandler: () => ({ status: 500 })
        }),
      DuplicateProviderError
    );

    equal(await notifyHttpRequest(TEST_PROVIDER, request), response);
  });

  it('assert :: reports an unregistered provider', () => {
    equal(providerRegistered(TEST_PROVIDER), false);
    equal(unregisterProvider(TEST_PROVIDER), false);
  });

  it('assert :: dispatches synchronous HTTP requests and returns their responses', async () => {
    const response: HttpProviderResponse = {
      status: 200,
      body: Buffer.from('response'),
      headers: {
        'content-type': 'text/plain'
      }
    };

    const handler = mock.fn((incoming: HttpProviderRequest) => {
      equal(incoming, request);
      return response;
    });

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: handler
    });

    equal(await notifyHttpRequest(TEST_PROVIDER, request), response);

    equal(handler.mock.callCount(), 1);
  });

  it('assert :: dispatches asynchronous HTTP requests and returns their responses', async () => {
    const response: HttpProviderResponse = {
      status: 200,
      body: Buffer.from('response'),
      headers: {
        'content-type': 'text/plain'
      }
    };

    const handler = mock.fn(async (incoming: HttpProviderRequest) => {
      equal(incoming, request);
      return response;
    });

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: handler
    });

    equal(await notifyHttpRequest(TEST_PROVIDER, request), response);

    equal(handler.mock.callCount(), 1);
  });

  it('assert :: propagates synchronous HTTP request handler errors', async () => {
    const error = new Error('Provider handler failed.');

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: () => {
        throw error;
      }
    });

    await rejects(notifyHttpRequest(TEST_PROVIDER, request), (received: unknown) => received === error);

    equal(providerRegistered(TEST_PROVIDER), true);
  });

  it('assert :: propagates asynchronous HTTP request handler errors', async () => {
    const error = new Error('Provider handler failed.');

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: async () => {
        throw error;
      }
    });

    await rejects(notifyHttpRequest(TEST_PROVIDER, request), (received: unknown) => received === error);

    equal(providerRegistered(TEST_PROVIDER), true);
  });

  it('assert :: rejects HTTP request notifications for an unregistered provider', async () => {
    await rejects(notifyHttpRequest(TEST_PROVIDER, request), MissingProviderError);
  });

  it('assert :: rejects HTTP request notifications for an incompatible provider', async () => {
    const handler = mock.fn(() => {});

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler: handler,
      disconnectHandler: handler,
      messageHandler: () => {}
    });

    await rejects(notifyHttpRequest(TEST_PROVIDER, request), IncompatibleProviderError);

    equal(providerRegistered(TEST_PROVIDER), true);
    equal(handler.mock.callCount(), 0);
  });
});
