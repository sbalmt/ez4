import type { Http } from '@ez4/gateway';

export declare class TestApi extends Http.Service {
  name: 'Test API';

  routes: [
    {
      path: 'GET /route';
      handler: typeof testHandler;
    }
  ];
}

declare class TestRequest implements Http.Request {
  /**
   * GET route query string.
   */
  query: {
    foo: string;
    bar?: number;
  };
}

/**
 * Get route response.
 */
declare class TestResponse implements Http.Response {
  status: 200;

  /**
   * GET route response.
   */
  body: {
    foo: string;
    bar: number;
  };
}

/**
 * Test the GET route documentation.
 */
function testHandler(_request: TestRequest): TestResponse {
  return {
    status: 200,
    body: {
      foo: 'foo',
      bar: 123
    }
  };
}
