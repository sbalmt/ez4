import type { Http } from '@ez4/gateway';
import type { SuccessResponse } from './common.js';

declare class TestRequest implements Http.Request {}

class TestErrorA extends Error {}
class TestErrorB extends Error {}
class TestErrorC extends Error {}

type TestErrorMap = {
  404: [TestErrorA, TestErrorB];
  422: [TestErrorC];
};

export declare class TestService extends Http.Service {
  routes: [
    {
      path: 'GET /test-route-a';
      handler: typeof testRoute;
      errors: TestErrorMap;
    }
  ];
}

export function testRoute(_request: TestRequest): SuccessResponse {
  return {
    status: 204
  };
}
