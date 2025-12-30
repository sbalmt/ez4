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

// @ts-expect-error No extra property is allowed
declare class AuthorizerRequest implements Ws.AuthRequest {
  invalid_property: true;
}

declare class AuthorizerResponse implements Ws.AuthResponse {
  identity?: {};
}

function authorizerHandler(_request: AuthorizerRequest): AuthorizerResponse {
  return {
    identity: undefined
  };
}

function connectHandler() {}

function disconnectHandler() {}

function messageHandler() {}
