import type { EmulateServiceContext, ServeOptions, ServiceEmulator } from '@ez4/project/library';
import type { HttpService, WsService } from '@ez4/gateway/library';
import type { WsProviderClient } from '@ez4/server';
import type { AnyObject } from '@ez4/utils';

import { deepEqual, equal, rejects } from 'node:assert/strict';
import { after, before, describe, it, mock } from 'node:test';
import { once } from 'node:events';

import { notifyHttpRequest, notifyWsConnect, notifyWsMessage, startServer } from '@ez4/server';

import { registerHttpLocalService } from '../src/provider/http/local';
import { registerWsLocalService } from '../src/provider/ws/local';

const objectSchema = (properties: AnyObject) => ({
  type: 'object',
  properties
});

const handler = (name: string, extra?: AnyObject) => ({
  file: 'test/files/handlers.ts',
  position: [1, 1],
  name,
  ...extra
});

const serveOptions = {
  projectName: 'local-gateway',
  prefix: 'ez4',
  serviceHost: 'localhost:3734',
  branchName: 'test',
  version: 1
} as unknown as ServeOptions;

const makeContext = (descriptors: () => AnyObject = () => ({}), references: AnyObject = {}) => {
  return {
    makeDescriptors: () => descriptors(),
    makeReferences: () => references,
    makeService: async () => undefined
  } as unknown as EmulateServiceContext;
};

const parseBody = (response: AnyObject | void) => {
  return JSON.parse(response?.body);
};

describe('worker gateway handlers', () => {
  const httpService = {
    name: 'TestHttp',
    variables: {},
    services: {},
    routes: [
      {
        path: 'POST /items/{id}',
        handler: handler('request', {
          response: {
            status: 200,
            body: objectSchema({
              id: {
                type: 'string'
              },
              page: {
                type: 'number'
              },
              name: {
                type: 'string'
              },
              user: {
                type: 'string'
              }
            })
          },
          request: {
            identity: objectSchema({
              user: {
                type: 'string'
              }
            }),
            parameters: objectSchema({
              id: {
                type: 'string'
              }
            }),
            query: objectSchema({
              page: {
                type: 'number'
              }
            }),
            body: objectSchema({
              name: {
                type: 'string'
              }
            })
          }
        }),
        authorizer: handler('authorizer', {
          request: {
            headers: objectSchema({
              authorization: {
                type: 'string'
              }
            })
          }
        })
      },
      {
        path: 'GET /not-found',
        handler: handler('notFound', {
          response: {
            status: 204
          }
        })
      },
      {
        path: 'GET /custom-error',
        handler: handler('customError', {
          response: {
            status: 204
          }
        }),
        httpErrors: {
          CustomError: 422
        }
      },
      {
        path: 'GET /authorizer-error',
        handler: handler('request', {
          response: {
            status: 200
          }
        }),
        authorizer: handler('notFound')
      },
      {
        path: 'GET /authorizer-custom-error',
        handler: handler('request', {
          response: {
            status: 200
          }
        }),
        authorizer: handler('customError'),
        httpErrors: {
          CustomError: 409
        }
      },
      {
        path: 'GET /unexpected-error',
        handler: handler('unexpectedError', {
          response: {
            status: 204
          }
        })
      }
    ]
  } as unknown as HttpService;

  const httpEmulator = registerHttpLocalService(httpService, serveOptions, makeContext());

  before(() => httpEmulator.bootstrapHandler!());
  after(() => httpEmulator.shutdownHandler!());

  it('assert :: http request with authorizer', async () => {
    const response = await notifyHttpRequest(httpEmulator.identifier, {
      method: 'POST',
      path: '/items/123',
      headers: {
        authorization: 'user-1'
      },
      query: {
        page: '2'
      },
      body: Buffer.from(
        JSON.stringify({
          name: 'item'
        })
      )
    });

    equal(response?.status, 200);

    deepEqual(parseBody(response), {
      id: '123',
      page: 2,
      name: 'item',
      user: 'user-1'
    });
  });

  it('assert :: http request validation error', async () => {
    const response = await notifyHttpRequest(httpEmulator.identifier, {
      method: 'POST',
      path: '/items/123',
      headers: {
        authorization: 'user-1'
      },
      query: {
        page: 'abc'
      }
    });

    equal(response?.status, 400);
  });

  it('assert :: http error from handler', async () => {
    const response = await notifyHttpRequest(httpEmulator.identifier, {
      method: 'GET',
      path: '/not-found',
      headers: {},
      query: {}
    });

    equal(response?.status, 404);

    deepEqual(parseBody(response), {
      type: 'error',
      message: 'Resource not found.',
      context: {
        resource: 'test'
      }
    });
  });

  it('assert :: custom error mapped from handler', async () => {
    const response = await notifyHttpRequest(httpEmulator.identifier, {
      method: 'GET',
      path: '/custom-error',
      headers: {},
      query: {}
    });

    equal(response?.status, 422);
    deepEqual(parseBody(response), {
      type: 'error',
      message: 'Custom failure.'
    });
  });

  it('assert :: HTTP errors from authorizers are mapped inside the worker', async () => {
    const response = await notifyHttpRequest(httpEmulator.identifier, {
      method: 'GET',
      path: '/authorizer-error',
      headers: {},
      query: {}
    });

    equal(response?.status, 404);
    deepEqual(parseBody(response), {
      type: 'error',
      message: 'Resource not found.',
      context: {
        resource: 'test'
      }
    });
  });

  it('assert :: custom authorizer errors use route mappings inside the worker', async () => {
    const response = await notifyHttpRequest(httpEmulator.identifier, {
      method: 'GET',
      path: '/authorizer-custom-error',
      headers: {},
      query: {}
    });

    equal(response?.status, 409);
    deepEqual(parseBody(response), {
      type: 'error',
      message: 'Custom failure.'
    });
  });

  it('assert :: unmapped HTTP handler errors still reject', async () => {
    await rejects(
      Promise.resolve(
        notifyHttpRequest(httpEmulator.identifier, {
          method: 'GET',
          path: '/unexpected-error',
          headers: {},
          query: {}
        })
      ),
      /Unexpected failure/
    );
  });

  it('assert :: host-side missing routes remain HTTP errors', async () => {
    const response = await notifyHttpRequest(httpEmulator.identifier, {
      method: 'GET',
      path: '/missing',
      headers: {},
      query: {}
    });

    equal(response?.status, 404);
  });

  describe('ws gateway', () => {
    const wsService = {
      name: 'TestWs',
      variables: {},
      services: {
        ws: {
          reference: 'TestWs'
        }
      },
      schema: objectSchema({
        echo: {
          type: 'string'
        }
      }),
      connect: {
        handler: handler('connection')
      },
      disconnect: {
        handler: handler('connection')
      },
      message: {
        handler: handler('message', {
          request: {
            body: objectSchema({
              text: {
                type: 'string'
              }
            })
          },
          response: {
            body: objectSchema({
              text: {
                type: 'string'
              }
            })
          }
        })
      }
    } as unknown as WsService;

    let wsEmulator: ServiceEmulator;

    const context = makeContext(
      () => ({
        TestWs: wsEmulator.exportDescriptor!()
      }),
      {
        ws: 'TestWs'
      }
    );

    wsEmulator = registerWsLocalService(wsService, serveOptions, context);

    const client: WsProviderClient = {
      id: 'connection-1',
      live: true,
      write: mock.fn(),
      close: mock.fn(() => Promise.resolve())
    };

    before(() => wsEmulator.bootstrapHandler!());
    after(() => wsEmulator.shutdownHandler!());

    it('assert :: ws message with client', async () => {
      const server = await startServer({
        name: 'test-gateway',
        host: '127.0.0.1',
        port: 3735
      });

      try {
        const socket = new WebSocket(`ws://127.0.0.1:3735/${wsEmulator.identifier}`);

        const messages: string[] = [];

        const received = new Promise<void>((resolve) => {
          socket.addEventListener('message', (event) => {
            messages.push(String(event.data));

            if (messages.length === 2) {
              resolve();
            }
          });
        });

        await once(socket, 'open');

        socket.send(
          JSON.stringify({
            text: 'hello'
          })
        );

        await received;

        // The handler pushes an echo through the WS client, then its response is written back.
        deepEqual(messages, [
          JSON.stringify({
            echo: 'hello'
          }),
          JSON.stringify({
            text: 'hello'
          })
        ]);

        const closed = once(socket, 'close');

        socket.close();

        await closed;
      } finally {
        await server.close();
      }
    });

    it('assert :: WS errors preserve their context when mapped inside the worker', async () => {
      const emulator = registerWsLocalService(
        {
          ...wsService,
          name: 'ErrorWs',
          services: {},
          message: {
            handler: handler('notFound')
          }
        } as unknown as WsService,
        serveOptions,
        makeContext()
      );

      await emulator.bootstrapHandler!();

      try {
        const response = await notifyWsMessage(emulator.identifier, {
          client,
          body: Buffer.from('{}')
        });

        deepEqual(JSON.parse(String(response)), {
          type: 'error',
          message: 'Resource not found.',
          context: {
            resource: 'test'
          }
        });
      } finally {
        await emulator.shutdownHandler!();
      }
    });

    it('assert :: WS validation errors are mapped inside the worker', async () => {
      await notifyWsConnect(wsEmulator.identifier, {
        id: client.id,
        headers: {}
      });

      const response = await notifyWsMessage(wsEmulator.identifier, {
        client,
        body: Buffer.from(
          JSON.stringify({
            text: 42
          })
        )
      });

      equal(JSON.parse(String(response)).type, 'error');
    });

    it('assert :: oversized WS messages close the connection without invoking the handler', async () => {
      const close = mock.fn(() => Promise.resolve());

      const response = await notifyWsMessage(wsEmulator.identifier, {
        client: {
          ...client,
          close
        },
        body: Buffer.alloc(128 * 1024 + 1, 0x61)
      });

      equal(response, undefined);
      equal(close.mock.callCount(), 1);
    });

    it('assert :: unmapped WS handler errors still reject', async () => {
      const emulator = registerWsLocalService(
        {
          ...wsService,
          name: 'UnexpectedWs',
          services: {},
          message: {
            handler: handler('unexpectedError')
          }
        } as unknown as WsService,
        serveOptions,
        makeContext()
      );

      await emulator.bootstrapHandler!();

      try {
        await rejects(
          notifyWsMessage(emulator.identifier, {
            client,
            body: Buffer.from('{}')
          }),
          /Unexpected failure/
        );
      } finally {
        await emulator.shutdownHandler!();
      }
    });
  });
});
