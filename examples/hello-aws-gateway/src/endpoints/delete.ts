import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ApiProvider } from '../provider';

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
export function deleteHandler(request: DeleteRequest, context: Service.Context<ApiProvider>): DeleteResponse {
  const { id } = request.parameters;
  const { selfVariables } = context;

  // Do some stuff...
  console.log(selfVariables.TEST_VAR1, id);

  return {
    status: 204
  };
}
