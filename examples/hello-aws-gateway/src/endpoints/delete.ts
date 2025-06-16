import type { String } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

/**
 * Delete request example.
 */
declare class DeleteRequest implements Http.Request {
  parameters: {
    /**
     * Example of `id` in the delete parameters.
     */
    id: String.UUID;
  };
}

/**
 * Delete response example.
 */
declare class DeleteResponse implements Http.Response {
  status: 204;
}

/**
 * Handler for `delete` requests.
 * @param request Incoming request.
 * @returns Outgoing response.
 */
export function deleteHandler(request: DeleteRequest): DeleteResponse {
  const { id } = request.parameters;

  // Do some stuff...
  id;

  return {
    status: 204
  };
}
