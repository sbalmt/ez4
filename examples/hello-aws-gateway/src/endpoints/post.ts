import type { Http } from '@ez4/gateway';

import { randomUUID } from 'node:crypto';

/**
 * Post request example.
 */
export declare class PostRequest implements Http.Request {
  body: {
    /**
     * Example of validated `string` property coming from the body request.
     */
    foo: string;
  };
}

/**
 * Post response example.
 */
export declare class PostResponse implements Http.Response {
  status: 201;

  body: {
    /**
     * Example of `id` in the response.
     */
    id: string;
  };
}

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
