import type { Http, Ws } from '@ez4/gateway';

type TestEvent = {
  foo: string;
  bar: number;
};

export declare class TestService extends Ws.Service<TestEvent> {
  routeKey: 'foo';

  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
    authorizer: typeof authorizerHandler;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  data: Ws.UseData<{
    handler: typeof dataHandler;
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

declare class ConnectRequest implements Http.Request {
  identity: {
    id: string;
  };
}

function connectHandler(_request: ConnectRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}

function disconnectHandler(_request: Ws.Incoming<null>) {}

function dataHandler(_request: Ws.Incoming<TestEvent>) {}
