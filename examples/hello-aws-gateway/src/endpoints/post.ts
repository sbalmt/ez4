import type { Http } from '@ez4/gateway';

import { randomUUID } from 'node:crypto';

import { CustomError } from '../errors.js';

/**
 * Post request example.
 */
export declare class PostRequest implements Http.Request {
  body: {
    /**
     * Example of validated `string` coming from the body request.
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
 * @param request Incoming request.
 * @returns Outgoing response.
 */
export function postHandler(request: PostRequest): PostResponse {
  const { foo } = request.body;

  // Check error catcher.
  if (foo === 'error') {
    throw new CustomError('Post error.');
  }

  return {
    status: 201,
    body: {
      id: randomUUID()
    }
  };
}
