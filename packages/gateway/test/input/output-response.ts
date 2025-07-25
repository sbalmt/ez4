import type { NamingStyle } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

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
    }
  ];
}

export function testRouteA(): ObjectResponse {
  return {
    status: 204,
    body: {
      foo: 'bar'
    }
  };
}

export function testRouteB(): UnionResponse {
  return {
    status: 204,
    body: 'abc'
  };
}

export function testRouteC(): ScalarResponse {
  return {
    status: 204,
    body: 123
  };
}

export function testRouteD(): NamingStyleResponse {
  return {
    status: 204,
    body: {
      fooBar: 'foo',
      barBaz: 123
    }
  };
}
