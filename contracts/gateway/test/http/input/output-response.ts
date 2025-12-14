import type { NamingStyle } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'ANY /test-route-a';
      handler: typeof testRouteA;
    }>,
    Http.UseRoute<{
      path: 'ANY /test-route-b';
      handler: typeof testRouteB;
    }>,
    Http.UseRoute<{
      path: 'ANY /test-route-c';
      handler: typeof testRouteC;
    }>,
    Http.UseRoute<{
      path: 'ANY /test-route-d';
      handler: typeof testRouteD;
      preferences: {
        namingStyle: NamingStyle.SnakeCase;
      };
    }>,
    Http.UseRoute<{
      path: 'ANY /test-route-e';
      handler: typeof testRouteE;
    }>,
    Http.UseRoute<{
      path: 'ANY /test-route-f';
      handler: typeof testRouteF;
    }>
  ];
}

interface ObjectResponse extends Http.Response {
  status: 204;
  body: {
    foo: string;
  };
}

function testRouteA(): ObjectResponse {
  return {
    status: 204,
    body: {
      foo: 'bar'
    }
  };
}

declare class UnionResponse implements Http.Response {
  status: 204;
  body: boolean | string;
}

function testRouteB(): UnionResponse {
  return {
    status: 204,
    body: 'abc'
  };
}

type ScalarResponse = {
  status: 204;
  body: number;
};

function testRouteC(): ScalarResponse {
  return {
    status: 204,
    body: 123
  };
}

declare class NamingStyleResponse implements Http.Response {
  status: 204;
  body: {
    fooBar: string;
    barBaz: number;
  };
}

function testRouteD(): NamingStyleResponse {
  return {
    status: 204,
    body: {
      fooBar: 'foo',
      barBaz: 123
    }
  };
}

declare class MultiStatusResponse implements Http.Response {
  status: 200 | 204;
}

function testRouteE(): MultiStatusResponse {
  return {
    status: 200
  };
}

function testRouteF(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
