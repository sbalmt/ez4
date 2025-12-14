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

// Missing Ws.Identity inheritance.
interface TestIdentity {}

declare class AuthorizerResponse implements Ws.AuthResponse {
  identity?: TestIdentity;
}

function authorizerHandler(): AuthorizerResponse {
  return {
    identity: undefined
  };
}

function connectHandler() {}

function disconnectHandler() {}

function messageHandler() {}
