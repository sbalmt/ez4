import type { Ws } from '@ez4/gateway';

export declare class TestService extends Ws.Service<{}> {
  // @ts-expect-error No extra property is allowed
  defaults: Ws.UseDefaults<{
    invalid_property: true;
  }>;

  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  message: Ws.UseMessage<{
    handler: typeof messageHandler;
  }>;
}

function connectHandler() {}

function disconnectHandler() {}

function messageHandler() {}
