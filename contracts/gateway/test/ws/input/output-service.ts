import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { NamingStyle } from '@ez4/schema';
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
    handler: typeof messageHandler1;
  }>;
}

/**
 * Description of the second test service.
 */
export declare class TestService2 extends Ws.Service<TestData> {
  stage: 'websocket';

  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
    architecture: ArchitectureType.Arm;
    logLevel: LogLevel.Information;
    logRetention: 15;
    memory: 128;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
    runtime: RuntimeType.Node24;
    preferences: {
      namingStyle: NamingStyle.SnakeCase;
    };
  }>;

  message: Ws.UseMessage<{
    handler: typeof messageHandler2;
    architecture: ArchitectureType.Arm;
    runtime: RuntimeType.Node24;
    timeout: 90;
    preferences: {
      namingStyle: NamingStyle.CamelCase;
    };
  }>;
}

function connectHandler() {}

function disconnectHandler() {}

function messageHandler1() {}

declare class Message2Response implements Ws.Response {
  body: {
    status: boolean;
  };
}

function messageHandler2(): Message2Response {
  return {
    body: {
      status: true
    }
  };
}
