import type { Http } from '@ez4/gateway';

/**
 * Get request example.
 */
export declare class GetRequest implements Http.Request {
  parameters: {
    /**
     * Example of `id` in the path parameters.
     */
    id: string;
  };
}

/**
 * Get response example.
 */
export declare class GetResponse implements Http.Response {
  status: 200;

  body: {
    foo: string;
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
