import type { EmulateServiceContext, EmulatorConnection, ServeOptions, ServiceEmulator } from '@ez4/project/library';
import type { HttpService, WsService } from '@ez4/gateway/library';
import type { AnyObject } from '@ez4/utils';

import { deepEqual, equal, rejects } from 'node:assert/strict';
import { after, before, describe, it, mock } from 'node:test';
import { setTimeout } from 'node:timers/promises';

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
              id: { type: 'string' },
              page: { type: 'number' },
              name: { type: 'string' },
              user: { type: 'string' }
            })
          },
          request: {
            identity: objectSchema({ user: { type: 'string' } }),
            parameters: objectSchema({ id: { type: 'string' } }),
            query: objectSchema({ page: { type: 'number' } }),
            body: objectSchema({ name: { type: 'string' } })
          }
        }),
        authorizer: handler('authorizer', {
          request: {
            headers: objectSchema({ authorization: { type: 'string' } })
          }
        })
      },
      {
        path: 'GET /not-found',
        handler: handler('notFound', { response: { status: 204 } })
      },
      {
        path: 'GET /custom-error',
        handler: handler('customError', { response: { status: 204 } }),
        httpErrors: {
          CustomError: 422
        }
      },
      {
        path: 'GET /authorizer-error',
        handler: handler('request', { response: { status: 200 } }),
        authorizer: handler('notFound')
      },
      {
        path: 'GET /authorizer-custom-error',
        handler: handler('request', { response: { status: 200 } }),
        authorizer: handler('customError'),
        httpErrors: { CustomError: 409 }
      },
      {
        path: 'GET /unexpected-error',
        handler: handler('unexpectedError', { response: { status: 204 } })
      }
    ]
  } as unknown as HttpService;

  const httpEmulator = registerHttpLocalService(httpService, serveOptions, makeContext());

  it('assert :: http request with authorizer', async () => {
    const response = await httpEmulator.requestHandler!({
      method: 'POST',
      path: '/items/123',
      headers: { authorization: 'user-1' },
      query: { page: '2' },
      body: Buffer.from(JSON.stringify({ name: 'item' }))
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
    const response = await httpEmulator.requestHandler!({
      method: 'POST',
      path: '/items/123',
      headers: { authorization: 'user-1' },
      query: { page: 'abc' }
    });

    equal(response?.status, 400);
  });

  it('assert :: http error from handler', async () => {
    const response = await httpEmulator.requestHandler!({
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
    const response = await httpEmulator.requestHandler!({
      method: 'GET',
      path: '/custom-error',
      headers: {},
      query: {}
    });

    equal(response?.status, 422);
    deepEqual(parseBody(response), { type: 'error', message: 'Custom failure.' });
  });

  it('assert :: HTTP errors from authorizers are mapped inside the worker', async () => {
    const response = await httpEmulator.requestHandler!({
      method: 'GET',
      path: '/authorizer-error',
      headers: {},
      query: {}
    });

    equal(response?.status, 404);
    deepEqual(parseBody(response), {
      type: 'error',
      message: 'Resource not found.',
      context: { resource: 'test' }
    });
  });

  it('assert :: custom authorizer errors use route mappings inside the worker', async () => {
    const response = await httpEmulator.requestHandler!({
      method: 'GET',
      path: '/authorizer-custom-error',
      headers: {},
      query: {}
    });

    equal(response?.status, 409);
    deepEqual(parseBody(response), { type: 'error', message: 'Custom failure.' });
  });

  it('assert :: unmapped HTTP handler errors still reject', async () => {
    await rejects(
      Promise.resolve(httpEmulator.requestHandler!({ method: 'GET', path: '/unexpected-error', headers: {}, query: {} })),
      /Unexpected failure/
    );
  });

  it('assert :: host-side missing routes remain HTTP errors', async () => {
    const response = await httpEmulator.requestHandler!({ method: 'GET', path: '/missing', headers: {}, query: {} });

    equal(response?.status, 404);
  });

  describe('ws gateway', () => {
    const wsService = {
      name: 'TestWs',
      variables: {},
      services: {
        ws: { reference: 'TestWs' }
      },
      schema: objectSchema({ echo: { type: 'string' } }),
      connect: { handler: handler('connection') },
      disconnect: { handler: handler('connection') },
      message: {
        handler: handler('message', {
          request: {
            body: objectSchema({ text: { type: 'string' } })
          },
          response: {
            body: objectSchema({ text: { type: 'string' } })
          }
        })
      }
    } as unknown as WsService;

    let wsEmulator: ServiceEmulator;

    const context = makeContext(() => ({ TestWs: wsEmulator.exportDescriptor!() }), { ws: 'TestWs' });

    wsEmulator = registerWsLocalService(wsService, serveOptions, context);

    const write = mock.fn((_data: Buffer | string) => {});

    const connection: EmulatorConnection = {
      id: 'connection-1',
      live: true,
      write,
      close: mock.fn()
    };

    before(() => wsEmulator.bootstrapHandler!());
    after(() => wsEmulator.shutdownHandler!());

    it('assert :: ws message with client', async () => {
      await wsEmulator.connectHandler!({ connection, headers: {} });

      const response = await wsEmulator.messageHandler!({
        connection,
        body: Buffer.from(JSON.stringify({ text: 'hello' }))
      });

      await setTimeout(100);

      equal(response, JSON.stringify({ text: 'hello' }));

      equal(write.mock.callCount(), 1);
      deepEqual(write.mock.calls[0].arguments, [JSON.stringify({ echo: 'hello' })]);
    });

    it('assert :: WS errors preserve their context when mapped inside the worker', async () => {
      const emulator = registerWsLocalService(
        { ...wsService, name: 'ErrorWs', services: {}, message: { handler: handler('notFound') } } as unknown as WsService,
        serveOptions,
        makeContext()
      );
      const response = await emulator.messageHandler!({ connection, body: Buffer.from('{}') });

      deepEqual(JSON.parse(String(response)), {
        type: 'error',
        message: 'Resource not found.',
        context: { resource: 'test' }
      });
    });

    it('assert :: WS validation errors are mapped inside the worker', async () => {
      const response = await wsEmulator.messageHandler!({
        connection,
        body: Buffer.from(JSON.stringify({ text: 42 }))
      });

      equal(JSON.parse(String(response)).type, 'error');
    });

    it('assert :: unmapped WS handler errors still reject', async () => {
      const emulator = registerWsLocalService(
        { ...wsService, name: 'UnexpectedWs', services: {}, message: { handler: handler('unexpectedError') } } as unknown as WsService,
        serveOptions,
        makeContext()
      );

      await rejects(Promise.resolve(emulator.messageHandler!({ connection, body: Buffer.from('{}') })), /Unexpected failure/);
    });
  });
});
