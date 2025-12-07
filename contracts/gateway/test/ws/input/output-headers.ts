import type { Ws } from '@ez4/gateway';

type TestEvent = {
  foo: string;
  bar: number;
};

export declare class TestService extends Ws.Service<TestEvent> {
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

declare class ConnectRequest implements Ws.Request {
  headers: {
    'x-secret': string;
  };
}

function connectHandler(_request: Ws.Incoming<ConnectRequest>) {}

function disconnectHandler(_request: Ws.EmptyRequest) {}

function messageHandler(_request: Ws.Incoming<TestEvent>) {}
