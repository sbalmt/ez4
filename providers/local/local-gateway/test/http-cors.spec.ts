import type { EmulateServiceContext, ServeOptions } from '@ez4/project/library';
import type { HttpService } from '@ez4/gateway/library';
import type { ServerInstance } from '@ez4/server';
import type { AnyObject } from '@ez4/utils';

import { equal } from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { startServer } from '@ez4/server';

import { registerHttpLocalService } from '../src/provider/http/local';

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

const context = {
  makeDescriptors: () => ({}),
  makeReferences: () => ({}),
  makeService: async () => undefined
} as unknown as EmulateServiceContext;

const service = {
  name: 'CorsHttp',
  variables: {},
  services: {},
  cors: {
    allowOrigins: ['https://app.example'],
    maxAge: 60
  },
  routes: [
    {
      path: 'GET /public',
      cors: true,
      handler: handler('request', {
        response: {
          status: 200
        }
      })
    },
    {
      path: 'POST /items/{id}',
      cors: true,
      handler: handler('request', {
        response: {
          status: 200
        },
        request: {
          headers: {
            type: 'object',
            properties: {
              'x-tenant': {
                type: 'string'
              }
            }
          }
        }
      }),
      authorizer: handler('authorizer', {
        request: {
          headers: {
            type: 'object',
            properties: {
              authorization: {
                type: 'string'
              }
            }
          }
        }
      })
    },
    {
      path: 'DELETE /internal',
      handler: handler('request', {
        response: {
          status: 204
        }
      })
    }
  ]
} as unknown as HttpService;

const emulator = registerHttpLocalService(service, serveOptions, context);
const BASE_URL = `http://127.0.0.1:3748/${emulator.identifier}`;

describe('local gateway CORS provider', () => {
  let server: ServerInstance;

  before(async () => {
    await emulator.bootstrapHandler!();
    server = await startServer({
      name: 'test-local-gateway-cors',
      host: '127.0.0.1',
      port: 3748
    });
  });

  after(async () => {
    await server.close();
    await emulator.shutdownHandler!();
  });

  it('assert :: answers preflight from the effective configuration derived from cors routes', async () => {
    const response = await fetch(BASE_URL + '/items/1', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://app.example',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization, x-tenant, content-type'
      }
    });

    equal(response.status, 204);
    equal(response.headers.get('Access-Control-Allow-Origin'), 'https://app.example');
    equal(response.headers.get('Access-Control-Allow-Credentials'), 'true');
    equal(response.headers.get('Access-Control-Allow-Methods'), 'GET,POST');
    equal(response.headers.get('Access-Control-Allow-Headers'), 'authorization,x-tenant,content-type');
    equal(response.headers.get('Access-Control-Max-Age'), '60');
  });

  it('assert :: refuses preflight for a method missing from the effective allowMethods', async () => {
    const response = await fetch(BASE_URL + '/internal', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://app.example',
        'Access-Control-Request-Method': 'DELETE'
      }
    });

    equal(response.status, 204);
    equal(response.headers.get('Access-Control-Allow-Origin'), null);
  });

  it('assert :: applies the configured headers to actual responses', async () => {
    const response = await fetch(BASE_URL + '/public', {
      headers: {
        Origin: 'https://app.example'
      }
    });

    equal(response.status, 200);
    equal(response.headers.get('Access-Control-Allow-Origin'), 'https://app.example');
    equal(response.headers.get('Access-Control-Allow-Credentials'), 'true');
  });

  it('assert :: omits CORS headers on actual responses for a disallowed origin', async () => {
    const response = await fetch(BASE_URL + '/public', {
      headers: {
        Origin: 'https://other.example'
      }
    });

    equal(response.status, 200);
    equal(response.headers.get('Access-Control-Allow-Origin'), null);
  });

  it('assert :: does not enable CORS when the service has no configuration', async () => {
    const plain = registerHttpLocalService(
      {
        ...service,
        name: 'PlainHttp',
        cors: undefined
      } as unknown as HttpService,
      serveOptions,
      context
    );

    await plain.bootstrapHandler!();

    try {
      const response = await fetch(`http://127.0.0.1:3748/${plain.identifier}/public`, {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://app.example',
          'Access-Control-Request-Method': 'GET'
        }
      });

      equal(response.status, 404);
      equal(response.headers.get('Access-Control-Allow-Origin'), null);
    } finally {
      await plain.shutdownHandler!();
    }
  });
});
