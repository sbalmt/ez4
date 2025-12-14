import type { Ws } from '@ez4/gateway';

type TestIdentity = {
  id: string;
};

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
  identity: TestIdentity;
}

function connectHandler(_event: Ws.Incoming<ConnectEvent>) {}

declare class DisconnectEvent implements Ws.Event {
  identity: TestIdentity;
}

function disconnectHandler(_event: Ws.Incoming<DisconnectEvent>) {}

declare class TestRequest implements Ws.Request {
  identity: TestIdentity;
}

function messageHandler(_request: Ws.Incoming<TestRequest>) {}
