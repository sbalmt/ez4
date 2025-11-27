import type { NamingStyle } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'GET /test-route-a';
      handler: typeof testRouteA;
    }>,
    Http.UseRoute<{
      path: 'GET /test-route-b';
      handler: typeof testRouteB;
    }>,
    Http.UseRoute<{
      path: 'GET /test-route-c';
      handler: typeof testRouteC;
    }>,
    Http.UseRoute<{
      path: 'GET /test-route-d';
      handler: typeof testRouteD;
      preferences: {
        namingStyle: NamingStyle.SnakeCase;
      };
    }>
  ];
}

declare class TestRawRequest implements Http.Request {
  body: Http.RawBody;
}

declare class TestJsonRequest implements Http.Request {
  body: {
    foo: string;
    bar: number;
  };
}

declare class TestOptionalRequest implements Http.Request {
  body?: {
    foo: string;
  };
}

declare class TestNamingStyleRequest implements Http.Request {
  body: {
    fooKey: string;
    barKey: number;
  };
}

function testRouteA(_request: Http.Incoming<TestRawRequest>): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}

function testRouteB(_request: TestJsonRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}

function testRouteC(_request: TestOptionalRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}

function testRouteD(_request: TestNamingStyleRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
