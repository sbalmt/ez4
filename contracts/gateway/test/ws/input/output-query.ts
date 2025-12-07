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

declare class ConnectRequest implements Ws.Request {
  query: {
    secret: string;
  };
}

function connectHandler(_request: Ws.Incoming<ConnectRequest>) {}

function disconnectHandler() {}

function messageHandler() {}
