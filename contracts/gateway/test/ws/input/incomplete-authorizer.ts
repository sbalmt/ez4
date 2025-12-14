import type { Ws } from '@ez4/gateway';

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

// Missing authorizer `identity`
declare class AuthorizerResponse implements Ws.AuthResponse {}

function authorizerHandler(): AuthorizerResponse {
  return {
    identity: undefined
  };
}

function connectHandler() {}

function disconnectHandler() {}

function messageHandler() {}
