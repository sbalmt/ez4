import type { Ws } from '@ez4/gateway';

export declare class TestService extends Ws.Service<{}> {
  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
    listener: typeof testListener;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
    listener: typeof testListener;
  }>;

  message: Ws.UseMessage<{
    handler: typeof messageHandler;
    listener: typeof testListener;
  }>;
}

function connectHandler() {}

function disconnectHandler() {}

function messageHandler() {}

function testListener() {}
