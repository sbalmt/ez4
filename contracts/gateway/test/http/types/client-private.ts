import type { Environment, Service } from '@ez4/common';
import type { Client, Http } from '@ez4/gateway';

import { assertType } from '@ez4/utils';

export declare class TestService extends Http.Service {
  client: Client<TestService>;

  routes: [
    Http.UseRoute<{
      name: 'testComplete';
      path: 'ANY /test-complete/{foo}';
      authorizer: typeof testHeaderAuthorizer;
      handler: typeof testCompleteRoute;
    }>,
    Http.UseRoute<{
      name: 'testHeader';
      path: 'ANY /test-header';
      authorizer: typeof testQueryAuthorizer;
      handler: typeof testHeaderRoute;
    }>,
    Http.UseRoute<{
      name: 'testQuery';
      path: 'ANY /test-query';
      authorizer: typeof testHeaderAuthorizer;
      handler: typeof testQueryRoute;
    }>,
    Http.UseRoute<{
      name: 'testBody';
      path: 'ANY /test-body';
      authorizer: typeof testQueryAuthorizer;
      handler: typeof testBodyRoute;
    }>
  ];

  services: {
    selfClient: Environment.Service<TestService>;
  };
}

declare class TestHeaderAuthorizerRequest implements Http.AuthRequest {
  headers: {
    authorization: string;
  };
}

declare class TestQueryAuthorizerRequest implements Http.AuthRequest {
  query: {
    secret: string;
  };
}

declare class TestAuthorizerResponse implements Http.AuthResponse {
  identity: {
    foo: string;
  };
}

async function testHeaderAuthorizer(_request: TestHeaderAuthorizerRequest): Promise<TestAuthorizerResponse> {
  return {
    identity: {
      foo: 'abc'
    }
  };
}

async function testQueryAuthorizer(_request: TestQueryAuthorizerRequest): Promise<TestAuthorizerResponse> {
  return {
    identity: {
      foo: 'def'
    }
  };
}

declare class TestCompleteRequest implements Http.Request {
  parameters: {
    foo: string;
  };
  headers: {
    bar: string;
  };
  query: {
    baz: string;
  };
  body: {
    qux: number;
  };
}

declare class TestCompleteResponse implements Http.Response {
  status: 200;
  body: {
    status: boolean;
  };
}

async function testCompleteRoute(_request: TestCompleteRequest, context: Service.Context<TestService>): Promise<TestCompleteResponse> {
  const { selfClient } = context;

  const response = await selfClient.testComplete({
    timeout: 15,
    parameters: {
      foo: 'abc'
    },
    headers: {
      authorization: 'token',
      bar: 'def'
    },
    query: {
      baz: 'ghi'
    },
    body: {
      qux: 123
    }
  });

  // Ensure response type.
  assertType<typeof response, TestCompleteResponse>(true);

  return {
    status: 200,
    body: {
      status: true
    }
  };
}

declare class TestHeaderRequest implements Http.Request {
  headers: {
    foo: string;
  };
}

async function testHeaderRoute(_request: TestHeaderRequest, context: Service.Context<TestService>): Promise<Http.SuccessEmptyResponse> {
  const { selfClient } = context;

  const response = await selfClient.testHeader({
    timeout: 15,
    headers: {
      foo: 'abc'
    },
    query: {
      secret: 'token'
    }
  });

  // Ensure response type.
  assertType<typeof response, Http.SuccessEmptyResponse>(true);

  return {
    status: 204
  };
}

declare class TestQueryRequest implements Http.Request {
  query: {
    foo: string;
  };
}

async function testQueryRoute(_request: TestQueryRequest, context: Service.Context<TestService>): Promise<Http.SuccessEmptyResponse> {
  const { selfClient } = context;

  const response = await selfClient.testQuery({
    timeout: 15,
    headers: {
      authorization: 'token'
    },
    query: {
      foo: 'abc'
    }
  });

  // Ensure response type.
  assertType<typeof response, Http.SuccessEmptyResponse>(true);

  return {
    status: 204
  };
}

declare class TestBodyRequest implements Http.Request {
  body: {
    foo: string;
  };
}

async function testBodyRoute(_request: TestBodyRequest, context: Service.Context<TestService>): Promise<Http.SuccessEmptyResponse> {
  const { selfClient } = context;

  const response = await selfClient.testBody({
    timeout: 15,
    query: {
      secret: 'token'
    },
    body: {
      foo: 'abc'
    }
  });

  // Ensure response type.
  assertType<typeof response, Http.SuccessEmptyResponse>(true);

  return {
    status: 204
  };
}
