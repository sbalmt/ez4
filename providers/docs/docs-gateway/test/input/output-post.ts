import type { String } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

export declare class TestApi extends Http.Service {
  name: 'Test API';

  routes: [
    {
      path: 'POST /route';
      handler: typeof testHandler;
    }
  ];
}

declare class TestRequest implements Http.Request {
  /**
   * POST route request.
   */
  body: {
    foo: string;
    bar: number;
  };
}

declare class TestResponse implements Http.Response {
  status: 201;

  /**
   * POST route response.
   */
  body: {
    id: String.UUID;
  };
}

/**
 * Test the POST route documentation.
 */
function testHandler(_request: TestRequest): TestResponse {
  return {
    status: 201,
    body: {
      id: '00000000-0000-1000-9000-000000000000'
    }
  };
}
