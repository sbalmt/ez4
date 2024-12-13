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

export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'ANY /test-route-1';
      handler: typeof testRoute1;
    },
    {
      path: 'ANY /test-route-2';
      handler: typeof testRoute2;
    },
    {
      path: 'ANY /test-route-3';
      handler: typeof testRoute3;
    }
  ];
}

export function testRoute1(): ObjectResponse {
  return {
    status: 204,
    body: {
      foo: 'bar'
    }
  };
}

export function testRoute2(): UnionResponse {
  return {
    status: 204,
    body: 'abc'
  };
}

export function testRoute3(): ScalarResponse {
  return {
    status: 204,
    body: 123
  };
}
