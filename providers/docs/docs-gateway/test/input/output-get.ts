import type { Http } from '@ez4/gateway';

export declare class TestApi extends Http.Service {
  name: 'Test API';

  routes: [
    Http.UseRoute<{
      path: 'GET /route';
      handler: typeof testHandler;
    }>
  ];
}

declare class TestRequest implements Http.Request {
  /**
   * @description GET route query string.
   */
  query: {
    foo: string;
    bar?: number;
  };
}

/**
 * @description Get route response.
 */
declare class TestResponse implements Http.Response {
  status: 200;

  /**
   * @description GET route response.
   */
  body: {
    foo: string;
    bar: number;
  };
}

/**
 * @summary Test the GET route documentation.
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
