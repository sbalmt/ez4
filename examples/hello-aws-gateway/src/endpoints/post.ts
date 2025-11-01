import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ApiProvider } from '../provider';

import { randomUUID } from 'node:crypto';

import { CustomError } from '../errors';

/**
 * Post request example.
 */
declare class PostRequest implements Http.Request {
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
declare class PostResponse implements Http.Response {
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
export function postHandler(request: PostRequest, context: Service.Context<ApiProvider>): PostResponse {
  const { foo } = request.body;
  const { selfVariables } = context;

  console.log(selfVariables.TEST_VAR1, foo);

  // Check custom error catcher.
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
