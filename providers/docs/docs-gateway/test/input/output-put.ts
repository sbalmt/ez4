import type { Http } from '@ez4/gateway';

export declare class TestApi extends Http.Service {
  name: 'Test API';

  routes: [
    {
      path: 'PUT /route';
      handler: typeof testHandler;
    }
  ];
}

declare class TestRequest implements Http.Request {
  /**
   * PUT route request.
   */
  body: {
    foo: string;
    bar: number;
  };
}

/**
 * Test the PUT route documentation.
 */
function testHandler(_request: TestRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
