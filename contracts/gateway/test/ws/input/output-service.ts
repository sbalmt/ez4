import type { Architecture, Runtime, Ws } from '@ez4/gateway';
import type { NamingStyle } from '@ez4/schema';

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
    logRetention: 15;
    memory: 128;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
    architecture: Architecture.Arm;
    runtime: Runtime.Node24;
  }>;

  message: Ws.UseMessage<{
    handler: typeof messageHandler;
    timeout: 90;
    preferences: {
      namingStyle: NamingStyle.CamelCase;
    };
  }>;
}

function connectHandler() {}

function disconnectHandler() {}

function messageHandler() {}
