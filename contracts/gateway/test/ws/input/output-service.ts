import type { Ws } from '@ez4/gateway';

type TestData = {
  foo: string;
  bar: number;
};

/**
 * First test service description.
 */
export declare class TestService1 extends Ws.Service<TestData> {
  name: 'Test Service 1';

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

/**
 * Description of the second test service.
 */
export declare class TestService2 extends Ws.Service<TestData> {
  stage: 'websocket';

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
