import type { ServerInstance, WsProviderConnection, WsProviderMessage } from '@ez4/server';

import { deepEqual, equal, match, ok, throws } from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import { connect } from 'node:net';
import { once } from 'node:events';

import { ProviderType, UnavailableConnectionError, getWsClient, registerProvider, startServer, unregisterProvider } from '@ez4/server';

const TEST_PROVIDER = 'test-http-websocket';
const BASE_URL = `http://127.0.0.1:3734`;

const upgradeSocket = async () => {
  const socket = connect(3734, '127.0.0.1');

  await once(socket, 'connect');

  socket.write(
    `GET /${TEST_PROVIDER} HTTP/1.1\r\n` +
      `Host: 127.0.0.1\r\n` +
      `Upgrade: websocket\r\n` +
      `Connection: Upgrade\r\n` +
      `Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n` +
      `Sec-WebSocket-Version: 13\r\n\r\n`
  );

  return socket;
};

describe('HTTP/1.1 WebSocket tests', async () => {
  let server: ServerInstance;

  beforeEach(async () => {
    server = await startServer({
      name: 'test-http',
      host: '127.0.0.1',
      port: 3734
    });
  });

  afterEach(async () => {
    await server.close();
    unregisterProvider(TEST_PROVIDER);
  });

  it('assert :: exchanges messages with the browser-style WebSocket API', async () => {
    const connected = mock.fn((connection: WsProviderConnection) => {
      deepEqual(connection.query, { value: 'test' });
    });

    const disconnected = new Promise<void>((resolve) => {
      registerProvider(TEST_PROVIDER, {
        type: ProviderType.Ws,
        connectHandler: connected,
        messageHandler: ({ body }) => body.toString(),
        disconnectHandler: () => resolve()
      });
    });

    const client = new WebSocket(`${BASE_URL.replace('http:', 'ws:')}/${TEST_PROVIDER}/test?value=test`);
    const message = once(client, 'message');

    await once(client, 'open');

    client.send('hello');

    const [event] = await message;

    equal(connected.mock.callCount(), 1);
    equal(event.data, 'hello');

    client.close();

    await disconnected;
  });

  it('assert :: holds the upgrade until the connect handler resolves', async () => {
    let accepted = false;

    const disconnected = new Promise<void>((resolve) => {
      registerProvider(TEST_PROVIDER, {
        type: ProviderType.Ws,
        connectHandler: async () => {
          await setTimeout(100);
          accepted = true;
        },
        disconnectHandler: () => resolve(),
        messageHandler: () => {}
      });
    });

    const client = new WebSocket(`${BASE_URL.replace('http:', 'ws:')}/${TEST_PROVIDER}`);

    await once(client, 'open');

    equal(accepted, true);

    client.close();

    await disconnected;
  });

  it('assert :: refuses the upgrade without opening when the connect handler throws', async () => {
    const connectHandler = mock.fn(() => {
      throw new Error('connect failed');
    });

    const disconnectHandler = mock.fn();
    const messageHandler = mock.fn();
    const openHandler = mock.fn();

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler,
      disconnectHandler,
      messageHandler
    });

    const client = new WebSocket(`${BASE_URL.replace('http:', 'ws:')}/${TEST_PROVIDER}`);

    client.addEventListener('open', openHandler);

    const [event] = await once(client, 'close');

    equal(event.code, 1006);
    equal(client.readyState, WebSocket.CLOSED);
    equal(openHandler.mock.callCount(), 0);
    equal(connectHandler.mock.callCount(), 1);
    equal(disconnectHandler.mock.callCount(), 0);
    equal(messageHandler.mock.callCount(), 0);
  });

  it('assert :: refuses the upgrade with the status carried by the connect error', async () => {
    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler: () => {
        throw Object.assign(new Error('forbidden'), { status: 403 });
      },
      disconnectHandler: () => {},
      messageHandler: () => {}
    });

    const socket = await upgradeSocket();

    const [response] = await once(socket, 'data');

    match(response.toString(), /^HTTP\/1\.1 403 /);

    socket.destroy();
  });

  it('assert :: exposes clients by id only while the connection is established', async () => {
    let connectionId: string | undefined;
    let clientDuringConnect: unknown;

    const disconnected = new Promise<string>((resolve) => {
      registerProvider(TEST_PROVIDER, {
        type: ProviderType.Ws,
        connectHandler: (connection) => {
          connectionId = connection.id;
          clientDuringConnect = getWsClient(connection.id);
        },
        disconnectHandler: (connection) => resolve(connection.id),
        messageHandler: () => {}
      });
    });

    const client = new WebSocket(`${BASE_URL.replace('http:', 'ws:')}/${TEST_PROVIDER}`);
    const message = once(client, 'message');

    await once(client, 'open');

    equal(clientDuringConnect, undefined);

    ok(connectionId);

    const wsClient = getWsClient(connectionId);

    ok(wsClient);

    equal(wsClient.id, connectionId);
    equal(wsClient.live, true);

    wsClient.write('hello');

    const [event] = await message;

    equal(event.data, 'hello');

    await wsClient.close();

    equal(await disconnected, connectionId);
    equal(getWsClient(connectionId), undefined);
    equal(wsClient!.live, false);

    throws(() => wsClient.write('after close'), UnavailableConnectionError);
  });

  it('assert :: reports no disconnection when the peer resets during a pending connect', async () => {
    const disconnectHandler = mock.fn();

    const connected = new Promise<void>((resolve) => {
      registerProvider(TEST_PROVIDER, {
        type: ProviderType.Ws,
        connectHandler: async () => {
          await setTimeout(100);
          resolve();
        },
        disconnectHandler,
        messageHandler: () => {}
      });
    });

    const socket = await upgradeSocket();

    await setTimeout(20);

    socket.resetAndDestroy();

    await connected;
    await setTimeout(50);

    equal(disconnectHandler.mock.callCount(), 0);
  });

  it('assert :: closes the connection cleanly when the provider closes the client', async () => {
    const disconnectHandler = mock.fn();

    const messageHandler = mock.fn(async (message: WsProviderMessage) => {
      await message.client.close();
    });

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler: () => {},
      disconnectHandler,
      messageHandler
    });

    const client = new WebSocket(`${BASE_URL.replace('http:', 'ws:')}/${TEST_PROVIDER}`);
    const opened = once(client, 'open');
    const closed = once(client, 'close');

    await opened;

    client.send('bye');

    const [event] = await closed;

    equal(event.code, 1005);
    equal(client.readyState, WebSocket.CLOSED);
    equal(disconnectHandler.mock.callCount(), 1);
    equal(messageHandler.mock.callCount(), 1);
  });

  it('assert :: closes the connection when the message handler throws', async () => {
    const connectHandler = mock.fn();
    const disconnectHandler = mock.fn();

    const messageHandler = mock.fn(() => {
      throw new Error('message failed');
    });

    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Ws,
      connectHandler,
      disconnectHandler,
      messageHandler
    });

    const client = new WebSocket(`${BASE_URL.replace('http:', 'ws:')}/${TEST_PROVIDER}`);
    const opened = once(client, 'open');
    const closed = once(client, 'close');

    await opened;

    client.send('hello');

    await closed;

    equal(client.readyState, WebSocket.CLOSED);
    equal(connectHandler.mock.callCount(), 1);
    equal(disconnectHandler.mock.callCount(), 1);
    equal(messageHandler.mock.callCount(), 1);
  });

  it('assert :: rejects a missing provider', async () => {
    const client = new WebSocket(`${BASE_URL.replace('http:', 'ws:')}/${TEST_PROVIDER}`);
    const closed = once(client, 'close');
    const opened = mock.fn();

    const failed = new Promise<void>((resolve) => {
      client.addEventListener('error', () => resolve(), { once: true });
    });

    client.addEventListener('open', opened);

    await failed;
    await closed;

    equal(client.readyState, WebSocket.CLOSED);
    equal(opened.mock.callCount(), 0);
  });

  it('assert :: rejects an HTTP provider before upgrading', async () => {
    registerProvider(TEST_PROVIDER, {
      type: ProviderType.Http,
      requestHandler: () => ({
        status: 204
      })
    });

    const client = new WebSocket(`${BASE_URL.replace('http:', 'ws:')}/${TEST_PROVIDER}`);
    const closed = once(client, 'close');
    const opened = mock.fn();

    const failed = new Promise<void>((resolve) => {
      client.addEventListener('error', () => resolve(), { once: true });
    });

    client.addEventListener('open', opened);

    await failed;
    await closed;

    equal(client.readyState, WebSocket.CLOSED);
    equal(opened.mock.callCount(), 0);
  });
});
