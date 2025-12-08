import type { HttpClient, Http } from '@ez4/gateway';

export declare class TestService extends Http.Service {
  routes: [
    Http.UseRoute<{
      name: 'testRoute';
      path: 'ANY /test-route';
      authorizer: typeof testAuth;
      handler: typeof testRoute;
    }>
  ];
}

export declare class TestImport extends Http.Import<TestService> {
  client: HttpClient<TestImport>;

  project: 'test project';

  authorization: {
    value: 'secret';
  };
}

declare class TestAuthRequest implements Http.AuthRequest {
  headers: {
    authorization: string;
  };
}

declare class TestAuthResponse implements Http.AuthResponse {
  identity: {
    user: string;
  };
}

function testAuth(_request: TestAuthRequest): TestAuthResponse {
  return {
    identity: {
      user: 'test'
    }
  };
}

declare class TestRouteRequest implements Http.Request {
  body: {
    foo: string;
  };
}

function testRoute(_request: TestRouteRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}

declare const client: TestImport['client'];

// Assert request can be made without headers
client.testRoute({
  body: {
    foo: 'foo'
  }
});
