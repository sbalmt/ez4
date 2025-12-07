import type { Ws } from '@ez4/gateway';

type TestData = {
  foo: string;
  bar: number;
};

export declare class TestService extends Ws.Service<TestData> {
  routeKey: 'foo';

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
