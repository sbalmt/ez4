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

  // Invoke GET route from imported API.
  const getResponse = await importedApi.getRoute({
    parameters: {
      id
    }
  });

  console.log('get', getResponse);

  // Invoke POST route from imported API.
  const postResponse = await importedApi.postRoute({
    body: {
      foo: 'foo'
    }
  });

  console.log('post', postResponse);

  // Invoke PATCH route from imported API.
  const patchResponse = await importedApi.patchRoute({
    parameters: {
      id
    },
    body: {
      foo: 'bar'
    }
  });

  console.log('patch', patchResponse);

  // Invoke PUT route from imported API.
  const putResponse = await importedApi.putRoute({
    parameters: {
      id
    },
    body: {
      foo: 'baz'
    }
  });

  console.log('put', putResponse);

  // Invoke DELETE route from imported API.
  const deleteResponse = await importedApi.deleteRoute({
    parameters: {
      id
    }
  });

  console.log('delete', deleteResponse);

  return {
    status: 204
  };
}
