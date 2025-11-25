import type { Http } from '@ez4/gateway';

export declare class TestApi extends Http.Service {
  name: 'Test API';

  routes: [
    {
      path: 'PATCH /route';
      handler: typeof testHandler;
    }
  ];
}

declare class TestRequest implements Http.Request {
  /**
   * PATCH route request.
   */
  body: {
    foo?: string;
    bar?: number;
  };
}

/**
 * Test the PATCH route documentation.
 */
function testHandler(_request: TestRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
