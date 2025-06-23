import type { String } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import { CustomError } from '../errors.js';

/**
 * Patch request example.
 */
declare class PatchRequest implements Http.Request {
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
 * Patch response example.
 */
declare class PatchResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * Example of `message` in the response.
     */
    message: string;
  };
}

/**
 * Handler for `patch` requests.
 * @param request Incoming request.
 * @returns Outgoing response.
 */
export function patchHandler(request: PatchRequest): PatchResponse {
  const { foo } = request.body;

  // Check custom error catcher.
  if (foo === 'error') {
    throw new CustomError('Patch error.');
  }

  return {
    status: 200,
    body: {
      message: 'success'
    }
  };
}
