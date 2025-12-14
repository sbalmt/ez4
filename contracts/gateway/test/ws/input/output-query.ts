import type { Ws } from '@ez4/gateway';

export declare class TestService extends Ws.Service<{}> {
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

declare class ConnectEvent implements Ws.Event {
  query: {
    secret: string;
  };
}

function connectHandler(_event: Ws.Incoming<ConnectEvent>) {}

function disconnectHandler() {}

function messageHandler() {}
