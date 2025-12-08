import type { Ws } from '@ez4/gateway';

type TestData = {
  foo: string;
  bar: number;
};

export declare class TestService extends Ws.Service<TestData> {
  routeKey: 'foo';

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
  headers: {
    'x-secret': string;
  };
}

function connectHandler(_event: Ws.Incoming<ConnectEvent>) {}

declare class DisconnectEvent implements Ws.Event {
  headers: {
    'x-secret': string;
  };
}

function disconnectHandler(_event: Ws.Incoming<DisconnectEvent>) {}

function messageHandler() {}
