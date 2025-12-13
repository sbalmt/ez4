import type { Http } from '@ez4/gateway';

export declare class TestApi extends Http.Service {
  name: 'Test API';

  routes: [
    Http.UseRoute<{
      path: 'GET /private';
      authorizer: typeof testAuthorizer;
      handler: typeof testHandler;
    }>
  ];
}

declare class TestAuthorizerRequest implements Http.AuthRequest {
  headers: {
    authorization: string;
  };
}

declare class TestAuthorizerResponse implements Http.AuthResponse {
  identity?: {
    id: string;
  };
}

function testAuthorizer(_request: TestAuthorizerRequest): TestAuthorizerResponse {
  return {
    identity: undefined
  };
}

function testHandler(): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}
