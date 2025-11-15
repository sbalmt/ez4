import type { Object, String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ApiProvider } from '../provider';

/**
 * Get request example.
 */
declare class GetRequest implements Http.Request {
  parameters: {
    /**
     * Example of `id` in the path parameters.
     */
    id: String.UUID;
  };

  query: {
    /**
     * Example of query string array.
     */
    foo?: string[];

    /**
     * Example of query string boolean.
     */
    bar?: boolean;
  };
}

/**
 * Get response example.
 */
declare class GetResponse implements Http.Response {
  status: 200;

  body: {
    /**
     * Example of `string` in the response.
     */
    fooBar: string;

    /**
     * Example of base64-encoded response.
     */
    bazQux: Object.Base64<{
      baz: number;
      qux: string;
    }>;
  };
}

/**
 * Handler for `get` requests.
 * @returns Outgoing response.
 */
export function getHandler(request: GetRequest, context: Service.Context<ApiProvider>): GetResponse {
  const { foo, bar } = request.query;
  const { id } = request.parameters;
  const { selfVariables } = context;

  // Do some stuff...
  console.log(selfVariables.TEST_VAR1, id, foo, bar);

  return {
    status: 200,
    body: {
      fooBar: 'Hello AWS API',
      bazQux: {
        baz: Date.now(),
        qux: 'EZ4'
      }
    }
  };
}
