import type { Ws } from '@ez4/gateway';

type TestUnionMessage = { foo: string } | { bar: number };

export declare class TestService1 extends Ws.Service<TestUnionMessage> {
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

type TestIntersectionMessage = { foo: string } & { bar: number };

export declare class TestService2 extends Ws.Service<TestIntersectionMessage> {
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

function connectHandler() {}

function disconnectHandler() {}

function messageHandler() {}
