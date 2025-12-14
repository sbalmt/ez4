import type { Ws } from '@ez4/gateway';

export declare class TestService extends Ws.Service<{}> {
  // @ts-ignore Missing required message handler.
  connect: Ws.UseConnect<{}>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  message: Ws.UseMessage<{
    handler: typeof messageHandler;
  }>;
}

function disconnectHandler() {}

function messageHandler() {}
