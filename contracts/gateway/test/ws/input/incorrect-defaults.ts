import type { Ws } from '@ez4/gateway';

// Missing Http.Defaults inheritance.
interface TestDefaults {}

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
