import type { Ws } from '@ez4/gateway';

export declare class TestService extends Ws.Service<{}> {
  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
  }>;

  // @ts-ignore Missing required message handler.
  disconnect: Ws.UseDisconnect<{}>;

  message: Ws.UseMessage<{
    handler: typeof messageHandler;
  }>;
}

function connectHandler() {}

function messageHandler() {}
