import type { String } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

/**
 * Get request example.
 */
export declare class GetRequest implements Http.Request {
  parameters: {
    /**
     * Example of `id` in the path parameters.
     */
    id: String.UUID;
  };
}

/**
 * Get response example.
 */
export declare class GetResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * Example of `string` in the response.
     */
    foo: string;
  };
}

/**
 * Handler for `get` requests.
 * @returns Outgoing response.
 */
export function getHandler(request: GetRequest): GetResponse {
  const { id } = request.parameters;

  // Do some stuff...
  id;

  return {
    status: 200,
    body: {
      foo: 'Hello AWS API'
    }
  };
}
