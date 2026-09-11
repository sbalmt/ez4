import type { HttpImport, HttpHandler, HttpRoute } from '@ez4/gateway/library';
import type { ObjectSchema } from '@ez4/schema';

import { deepEqual, equal, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getClientAuthorization, getClientOperations } from '@ez4/gateway/library';
import { sendClientRequest } from '@ez4/gateway/utils';
import { AuthorizationType, HttpError } from '@ez4/gateway';
import { NamingStyle, SchemaType } from '@ez4/schema';

describe('gateway client utils', () => {
  const emptyRoutes: HttpRoute[] = [];

  const importService: HttpImport = {
    type: '@ez4/import:http',
    name: 'TestImport',
    context: {},
    reference: 'TestService',
    project: 'test-project',
    routes: emptyRoutes
  };

  it('assert :: get authorization (bearer)', () => {
    const authorization = getClientAuthorization({
      ...importService,
      authorization: {
        type: AuthorizationType.Bearer,
        header: 'x-auth',
        value: 'secret'
      }
    });

    deepEqual(authorization, {
      header: 'x-auth',
      value: 'Bearer secret'
    });
  });

  it('assert :: get authorization (missing)', () => {
    const authorization = getClientAuthorization(importService);

    equal(authorization, undefined);
  });

  it('assert :: get named client operations', () => {
    const responseSchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {}
    };

    const requestBodySchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        bodyValue: {
          type: SchemaType.String
        }
      }
    };

    const querySchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        queryValue: {
          type: SchemaType.String
        }
      }
    };

    const requiredHeaders: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        authorization: {
          type: SchemaType.String
        }
      }
    };

    const optionalHeaders: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        authorization: {
          type: SchemaType.String,
          optional: true
        }
      }
    };

    const handler: HttpHandler = {
      name: 'handler',
      file: 'test.ts',
      position: [0, 0] as [number, number],
      response: {
        status: 200,
        body: responseSchema
      },
      request: {
        body: requestBodySchema,
        query: querySchema
      }
    };

    const service: HttpImport = {
      ...importService,
      defaults: {
        preferences: {
          namingStyle: NamingStyle.SnakeCase
        }
      },
      authorization: {
        type: AuthorizationType.Bearer,
        header: 'authorization',
        value: 'secret'
      },
      routes: [
        {
          name: 'requiredAuth',
          path: 'GET /required',
          handler,
          preferences: {
            namingStyle: NamingStyle.CamelCase
          },
          authorizer: {
            ...handler,
            request: {
              headers: requiredHeaders
            },
            response: {
              identity: responseSchema
            }
          }
        },
        {
          name: 'optionalAuth',
          path: 'POST /optional',
          handler,
          authorizer: {
            ...handler,
            request: {
              headers: optionalHeaders
            },
            response: {
              identity: responseSchema
            }
          }
        },
        {
          name: 'noAuth',
          path: 'DELETE /no-auth',
          handler
        }
      ]
    };

    const operations = getClientOperations(service);

    equal(operations.requiredAuth.authorize, true);
    equal(operations.requiredAuth.namingStyle, NamingStyle.CamelCase);
    equal(operations.requiredAuth.method, 'GET');
    equal(operations.requiredAuth.path, '/required');
    deepEqual(operations.requiredAuth.querySchema, querySchema);
    deepEqual(operations.requiredAuth.bodySchema, requestBodySchema);
    deepEqual(operations.requiredAuth.responseSchema, responseSchema);

    equal(operations.optionalAuth.authorize, false);
    equal(operations.optionalAuth.namingStyle, NamingStyle.SnakeCase);
    equal(operations.optionalAuth.method, 'POST');
    equal(operations.optionalAuth.path, '/optional');
    deepEqual(operations.optionalAuth.querySchema, querySchema);
    deepEqual(operations.optionalAuth.bodySchema, requestBodySchema);
    deepEqual(operations.optionalAuth.responseSchema, responseSchema);

    equal(operations.noAuth.authorize, false);
    equal(operations.noAuth.namingStyle, NamingStyle.SnakeCase);
    equal(operations.noAuth.method, 'DELETE');
    equal(operations.noAuth.path, '/no-auth');
    deepEqual(operations.noAuth.querySchema, querySchema);
    deepEqual(operations.noAuth.bodySchema, requestBodySchema);
    deepEqual(operations.noAuth.responseSchema, responseSchema);
  });

  it('assert :: send client request (success)', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async (input, init) => {
      const headers = new Headers(init?.headers);

      equal(input, 'https://example.test/items');
      equal(init?.method, 'POST');

      equal(headers.get('x-test'), 'yes');
      equal(headers.get('authorization'), 'Bearer secret');
      equal(headers.get('content-type'), 'application/json');
      equal(init?.body, '{"foo":"bar"}');

      return new Response('{"ok":true}', {
        status: 200,
        headers: {
          'x-result': 'yes'
        }
      });
    };

    try {
      const response = await sendClientRequest('https://example.test/items', 'POST', {
        headers: {
          'x-test': 'yes'
        },
        authorization: {
          header: 'authorization',
          value: 'Bearer secret'
        },
        body: {
          foo: 'bar'
        },
        bodySchema: {
          type: SchemaType.Object,
          properties: {
            foo: {
              type: SchemaType.String
            }
          }
        },
        responseSchema: {
          type: SchemaType.Object,
          properties: {
            ok: {
              type: SchemaType.Boolean
            }
          }
        }
      });

      deepEqual(response, {
        status: 200,
        headers: {
          'content-type': 'text/plain;charset=UTF-8',
          'x-result': 'yes'
        },
        body: {
          ok: true
        }
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('assert :: send client request (failure)', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () => new Response('{}', { status: 403 });

    try {
      await rejects(() => sendClientRequest('https://ez4.test', 'GET', {}), HttpError);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('assert :: send client request (empty response)', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () => new Response(null, { status: 204 });

    try {
      deepEqual(await sendClientRequest('https://ez4.test', 'GET', {}), {
        status: 204,
        headers: {}
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('assert :: propagate fetch failure', async () => {
    const originalFetch = globalThis.fetch;

    const failure = new Error('Connection failed');

    globalThis.fetch = async () => Promise.reject(failure);

    try {
      await rejects(() => sendClientRequest('https://ez4.test', 'GET', {}), failure);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('assert :: propagate malformed error response', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () => new Response('not-json', { status: 403 });

    try {
      await rejects(() => sendClientRequest('https://ez4.test', 'GET', {}), SyntaxError);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('assert :: abort timed out request', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async (_input, init) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
      });
    };

    try {
      await rejects(
        () => sendClientRequest('https://ez4.test', 'GET', { timeout: 0 }),
        (error: unknown) => error === 'Request timed out'
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
