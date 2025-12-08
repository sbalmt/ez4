import type { Http, Ws } from '@ez4/gateway';

type TestData = {
  foo: string;
  bar: number;
};

type TestIdentity = {
  id: string;
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
  identity?: TestIdentity;
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

declare class ConnectEvent implements Ws.Event {
  identity: TestIdentity;
}

function connectHandler(_event: Ws.Incoming<ConnectEvent>) {}

declare class DisconnectEvent implements Ws.Event {
  identity: TestIdentity;
}

function disconnectHandler(_event: Ws.Incoming<DisconnectEvent>) {}

declare class MessageRequest implements Ws.Request {
  body: TestData;
}

function messageHandler(_request: Ws.Incoming<MessageRequest>) {}
