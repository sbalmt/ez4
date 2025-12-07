import type { Http, Ws } from '@ez4/gateway';

type TestData = {
  foo: string;
  bar: number;
};

export declare class TestService extends Ws.Service<TestData> {
  routeKey: 'foo';

  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
    authorizer: typeof authorizerHandler;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  message: Ws.UseMessage<{
    handler: typeof messageHandler;
  }>;
}

declare class AuthorizerRequest implements Http.AuthRequest {
  query: {
    apiKey: string;
  };
}

declare class AuthorizerResponse implements Http.AuthResponse {
  identity?: {
    id: string;
  };
}

function authorizerHandler(request: AuthorizerRequest): AuthorizerResponse {
  if (request.query.apiKey !== 'test-token') {
    return {
      identity: undefined
    };
  }

  return {
    identity: {
      id: 'abc-123'
    }
  };
}

declare class ConnectRequest implements Ws.Request {
  identity: {
    id: string;
  };
}

function connectHandler(_request: Ws.Incoming<ConnectRequest>) {}

function disconnectHandler() {}

function messageHandler() {}
