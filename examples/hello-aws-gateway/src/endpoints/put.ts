import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ApiProvider } from '../provider';

import { CustomError } from '../errors';

/**
 * Put request example.
 */
declare class PutRequest implements Http.Request {
  parameters: {
    /**
     * Example of `id` in the path parameters.
     */
    id: String.UUID;
  };

  body: {
    /**
     * Example of validated `string` coming from the body request.
     */
    foo: string;
  };
}

/**
 * Put response example.
 */
declare class PutResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * Example of `message` in the response.
     */
    message: string;
  };
}

/**
 * Handler for `put` requests.
 * @param request Incoming request.
 * @returns Outgoing response.
 */
export function putHandler(request: PutRequest, context: Service.Context<ApiProvider>): PutResponse {
  const { selfVariables } = context;
  const { foo } = request.body;

  console.log(selfVariables.TEST_VAR1, foo);

  // Check default error catcher.
  if (foo === 'error') {
    throw new CustomError('Put error.');
  }

  return {
    status: 200,
    body: {
      message: 'success'
    }
  };
}
