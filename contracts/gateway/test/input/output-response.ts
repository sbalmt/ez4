import type { NamingStyle } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route-a';
      handler: typeof testRouteA;
    },
    {
      path: 'ANY /test-route-b';
      handler: typeof testRouteB;
    },
    {
      path: 'ANY /test-route-c';
      handler: typeof testRouteC;
    },
    {
      path: 'ANY /test-route-d';
      handler: typeof testRouteD;
      preferences: {
        namingStyle: NamingStyle.SnakeCase;
      };
    },
    {
      path: 'ANY /test-route-e';
      handler: typeof testRouteE;
    }
  ];
}

interface ObjectResponse extends Http.Response {
  status: 204;
  body: {
    foo: string;
  };
}

declare class UnionResponse implements Http.Response {
  status: 204;
  body: boolean | string;
}

type ScalarResponse = {
  status: 204;
  body: number;
};

declare class NamingStyleResponse implements Http.Response {
  status: 204;
  body: {
    fooBar: string;
    barBaz: number;
  };
}

declare class MultiStatusResponse implements Http.Response {
  status: 200 | 204;
}

function testRouteA(): ObjectResponse {
  return {
    status: 204,
    body: {
      foo: 'bar'
    }
  };
}

function testRouteB(): UnionResponse {
  return {
    status: 204,
    body: 'abc'
  };
}

function testRouteC(): ScalarResponse {
  return {
    status: 204,
    body: 123
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

function testRouteE(): MultiStatusResponse {
  return {
    status: 200
  };
}
