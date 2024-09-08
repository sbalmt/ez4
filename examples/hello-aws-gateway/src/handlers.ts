import type { GetRequest, GetResponse, PostRequest, PostResponse } from './types.js';

import { randomUUID } from 'node:crypto';

/**
 * Handler for `post` requests.
 * @param request Incoming post request.
 * @returns Outgoing post response.
 */
export function postHandler(request: PostRequest): PostResponse {
  const { body } = request;

  // Do some stuff...
  body.foo;

  return {
    status: 201,

    body: {
      id: randomUUID()
    }
  };
}

/**
 * Handler for `get` requests.
 * @returns Outgoing get response.
 */
export function getHandler(request: GetRequest): GetResponse {
  const { parameters } = request;

  // Do some stuff...
  parameters.id;

  return {
    status: 200,

    body: {
      foo: 'Hello AWS API'
    }
  };
}
