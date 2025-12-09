import type { Ws } from '@ez4/gateway';

export declare class TestService extends Ws.Service<{}> {
  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  // @ts-ignore Missing required message handler.
  message: Ws.UseMessage<{}>;
}

function connectHandler() {}

function disconnectHandler() {}
