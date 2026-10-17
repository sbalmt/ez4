import type { WsProviderConnection, WsProviderMessage } from '@ez4/server';

import { equal, rejects } from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';

import {
  IncompatibleProviderError,
  MissingProviderError,
  ProviderType,
  notifyWsConnect,
  notifyWsDisconnect,
  notifyWsMessage,
  providerRegistered,
  registerProvider,
  unregisterProvider
} from '@ez4/server';

const TEST_PROVIDER = 'test-ws-provider';

const connection: WsProviderConnection = {
  id: 'test-connection',
  headers: {
    origin: 'http://localhost'
  },
  query: {
    value: 'test'
  }
};

const message: WsProviderMessage = {
  body: Buffer.from('test message'),
  client: {
    id: connection.id,
    live: true,
    write: () => {},
    close: async () => {}
  }
};

describe('WebSocket provider tests', () => {
  afterEach(() => {
    unregisterProvider(TEST_PROVIDER);
  });

  it('assert :: dispatches synchronous WebSocket lifecycle events', async () => {
    const connectHandler = mock.fn((incoming: WsProviderConnection) => {
      equal(incoming, connection);
    });

    const disconnectHandler = mock.fn((incoming: WsProviderConnection) => {
      equal(incoming, connection);
    });

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler,
      messageHandler: () => {},
      disconnectHandler
    });

    equal(await notifyWsConnect(TEST_PROVIDER, connection), undefined);
    equal(await notifyWsDisconnect(TEST_PROVIDER, connection), undefined);

    equal(connectHandler.mock.callCount(), 1);
    equal(disconnectHandler.mock.callCount(), 1);
  });

  it('assert :: dispatches asynchronous WebSocket lifecycle events', async () => {
    const connectHandler = mock.fn(async (incoming: WsProviderConnection) => {
      equal(incoming, connection);
    });

    const disconnectHandler = mock.fn(async (incoming: WsProviderConnection) => {
      equal(incoming, connection);
    });

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler,
      messageHandler: () => {},
      disconnectHandler
    });

    equal(await notifyWsConnect(TEST_PROVIDER, connection), undefined);
    equal(await notifyWsDisconnect(TEST_PROVIDER, connection), undefined);

    equal(connectHandler.mock.callCount(), 1);
    equal(disconnectHandler.mock.callCount(), 1);
  });

  it('assert :: returns text from synchronous WebSocket message handlers', async () => {
    const response = 'text response';

    const handler = mock.fn((incoming: WsProviderMessage) => {
      equal(incoming, message);
      return response;
    });

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler: () => {},
      messageHandler: handler,
      disconnectHandler: () => {}
    });

    equal(await notifyWsMessage(TEST_PROVIDER, message), response);

    equal(handler.mock.callCount(), 1);
  });

  it('assert :: returns no response from synchronous WebSocket message handlers', async () => {
    const handler = mock.fn((incoming: WsProviderMessage) => {
      equal(incoming, message);
    });

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler: () => {},
      messageHandler: handler,
      disconnectHandler: () => {}
    });

    equal(await notifyWsMessage(TEST_PROVIDER, message), undefined);

    equal(handler.mock.callCount(), 1);
  });

  it('assert :: returns text from asynchronous WebSocket message handlers', async () => {
    const response = 'text response';

    const handler = mock.fn(async (incoming: WsProviderMessage) => {
      equal(incoming, message);
      return response;
    });

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler: () => {},
      messageHandler: handler,
      disconnectHandler: () => {}
    });

    equal(await notifyWsMessage(TEST_PROVIDER, message), response);
    equal(handler.mock.callCount(), 1);
  });

  it('assert :: returns no response from asynchronous WebSocket message handlers', async () => {
    const handler = mock.fn(async (incoming: WsProviderMessage) => {
      equal(incoming, message);
    });

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler: () => {},
      messageHandler: handler,
      disconnectHandler: () => {}
    });

    equal(await notifyWsMessage(TEST_PROVIDER, message), undefined);

    equal(handler.mock.callCount(), 1);
  });

  it('assert :: rejects WebSocket connection notifications for an unregistered provider', async () => {
    await rejects(notifyWsConnect(TEST_PROVIDER, connection), MissingProviderError);
  });

  it('assert :: rejects WebSocket message notifications for an unregistered provider', async () => {
    await rejects(notifyWsMessage(TEST_PROVIDER, message), MissingProviderError);
  });

  it('assert :: rejects WebSocket disconnection notifications for an unregistered provider', async () => {
    await rejects(notifyWsDisconnect(TEST_PROVIDER, connection), MissingProviderError);
  });

  it('assert :: rejects WebSocket connection notifications for an incompatible provider', async () => {
    const handler = mock.fn(() => ({ status: 204 }));

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: handler
    });

    await rejects(notifyWsConnect(TEST_PROVIDER, connection), IncompatibleProviderError);

    equal(providerRegistered(TEST_PROVIDER), true);
    equal(handler.mock.callCount(), 0);
  });

  it('assert :: rejects WebSocket message notifications for an incompatible provider', async () => {
    const handler = mock.fn(() => ({ status: 204 }));

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: handler
    });

    await rejects(notifyWsMessage(TEST_PROVIDER, message), IncompatibleProviderError);

    equal(providerRegistered(TEST_PROVIDER), true);
    equal(handler.mock.callCount(), 0);
  });

  it('assert :: rejects WebSocket disconnection notifications for an incompatible provider', async () => {
    const handler = mock.fn(() => ({ status: 204 }));

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: handler
    });

    await rejects(notifyWsDisconnect(TEST_PROVIDER, connection), IncompatibleProviderError);

    equal(providerRegistered(TEST_PROVIDER), true);
    equal(handler.mock.callCount(), 0);
  });

  it('assert :: propagates synchronous WebSocket connection handler errors', async () => {
    const error = new Error('Provider handler failed.');

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler: () => {
        throw error;
      },
      disconnectHandler: () => {},
      messageHandler: () => {}
    });

    await rejects(notifyWsConnect(TEST_PROVIDER, connection), (received: unknown) => received === error);

    equal(providerRegistered(TEST_PROVIDER), true);
  });

  it('assert :: propagates asynchronous WebSocket connection handler errors', async () => {
    const error = new Error('Provider handler failed.');

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler: async () => {
        throw error;
      },
      disconnectHandler: () => {},
      messageHandler: () => {}
    });

    await rejects(notifyWsConnect(TEST_PROVIDER, connection), (received: unknown) => received === error);

    equal(providerRegistered(TEST_PROVIDER), true);
  });

  it('assert :: propagates synchronous WebSocket message handler errors', async () => {
    const error = new Error('Provider handler failed.');

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler: () => {},
      disconnectHandler: () => {},
      messageHandler: () => {
        throw error;
      }
    });

    await rejects(notifyWsMessage(TEST_PROVIDER, message), (received: unknown) => received === error);

    equal(providerRegistered(TEST_PROVIDER), true);
  });

  it('assert :: propagates asynchronous WebSocket message handler errors', async () => {
    const error = new Error('Provider handler failed.');

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler: () => {},
      disconnectHandler: () => {},
      messageHandler: async () => {
        throw error;
      }
    });

    await rejects(notifyWsMessage(TEST_PROVIDER, message), (received: unknown) => received === error);

    equal(providerRegistered(TEST_PROVIDER), true);
  });

  it('assert :: propagates synchronous WebSocket disconnection handler errors', async () => {
    const error = new Error('Provider handler failed.');

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler: () => {},
      disconnectHandler: () => {
        throw error;
      },
      messageHandler: () => {}
    });

    await rejects(notifyWsDisconnect(TEST_PROVIDER, connection), (received: unknown) => received === error);

    equal(providerRegistered(TEST_PROVIDER), true);
  });

  it('assert :: propagates asynchronous WebSocket disconnection handler errors', async () => {
    const error = new Error('Provider handler failed.');

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler: () => {},
      disconnectHandler: async () => {
        throw error;
      },
      messageHandler: () => {}
    });

    await rejects(notifyWsDisconnect(TEST_PROVIDER, connection), (received: unknown) => received === error);

    equal(providerRegistered(TEST_PROVIDER), true);
  });
});
