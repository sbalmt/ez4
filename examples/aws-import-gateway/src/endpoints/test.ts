import type { String } from '@ez4/schema';
import type { Service } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { ApiProvider } from '../provider';

/**
 * Test request example.
 */
declare class TestRequest implements Http.Request {
  query: {
    /**
     * Example of `id` in the query strings.
     */
    id: String.UUID;
  };
}

/**
 * Handler for `test` requests.
 * @returns Outgoing response.
 */
export async function testHandler(request: TestRequest, context: Service.Context<ApiProvider>): Promise<Http.SuccessEmptyResponse> {
  const { id } = request.query;
  const { importedApi } = context;

  // Invoke an operation from the imported API.
  const response = await importedApi.patchRoute({
    parameters: {
      id
    },
    body: {
      foo: 'bar'
    }
  });

  console.log(response.status, response.body);

  return {
    status: 204
  };
}
