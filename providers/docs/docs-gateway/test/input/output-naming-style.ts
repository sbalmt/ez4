import type { NamingStyle } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

export declare class TestApi extends Http.Service {
  name: 'Test API';

  routes: [
    Http.UseRoute<{
      path: 'GET /route_a';
      handler: typeof testHandler;
    }>,
    Http.UseRoute<{
      path: 'GET /route_b';
      handler: typeof testHandler;
      preferences: {
        namingStyle: NamingStyle.PascalCase;
      };
    }>
  ];
}

declare class TestRequest implements Http.Request {
  query: {
    foo_bar: boolean;
    bar_foo: boolean;
  };
}

function testHandler(_request: TestRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
