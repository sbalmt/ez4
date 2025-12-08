import type { Ws } from '@ez4/gateway';

type TestData = {
  foo: string;
  bar: number;
};

type TestIdentity = {
  id: string;
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
  identity: TestIdentity;
}

function connectHandler(_event: Ws.Incoming<ConnectEvent>) {}

declare class DisconnectEvent implements Ws.Event {
  identity: TestIdentity;
}

function disconnectHandler(_event: Ws.Incoming<DisconnectEvent>) {}

declare class TestRequest implements Ws.Request {
  identity: TestIdentity;
  body: TestData;
}

function messageHandler(_request: Ws.Incoming<TestRequest>) {}
