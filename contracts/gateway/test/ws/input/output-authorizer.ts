import type { Environment, Service } from '@ez4/common';
import type { Ws } from '@ez4/gateway';

type TestIdentity = {
  id: string;
};

export declare class TestService extends Ws.Service<{}> {
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

declare class AuthorizerRequest implements Ws.AuthRequest {
  query: {
    apiKey: string;
  };
}

declare class AuthorizerResponse implements Ws.AuthResponse {
  identity?: TestIdentity;
}

declare class AuthorizerProvider implements Ws.AuthProvider {
  variables: {
    TEST_VAR: 'test-literal-value';
  };

  services: {
    selfClient: Environment.Service<TestService>;
  };
}

function authorizerHandler(request: AuthorizerRequest, context: Service.Context<AuthorizerProvider>): AuthorizerResponse {
  if (request.query.apiKey !== 'test-token') {
    return {
      identity: undefined
    };
  }

  // Ensure provider client
  context.selfClient;

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
  body: {};
}

function messageHandler(_request: Ws.Incoming<MessageRequest>) {}
