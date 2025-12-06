import type { Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      path: 'GET /test-route-a';
      handler: typeof testRoute;
      httpErrors: TestErrorMap;
    }>
  ];
}

class TestErrorA extends Error {}
class TestErrorB extends Error {}
class TestErrorC extends Error {}

type TestErrorMap = {
  404: [TestErrorA, TestErrorB];
  422: [TestErrorC];
};

function testRoute(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
