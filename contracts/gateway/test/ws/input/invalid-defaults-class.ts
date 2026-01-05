import type { Ws } from '@ez4/gateway';

// Concrete class is not allowed.
class TestDefaults implements Ws.Defaults {}

export declare class TestService extends Ws.Service<{}> {
  defaults: TestDefaults;

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
