import type { ArchitectureType, RuntimeType } from '@ez4/common';
import type { NamingStyle } from '@ez4/schema';
import type { Ws } from '@ez4/gateway';

export declare class TestService extends Ws.Service<{}> {
  name: 'Test Service';

  defaults: Ws.UseDefaults<{
    listener: typeof testListener;
    architecture: ArchitectureType.Arm;
    runtime: RuntimeType.Node24;
    logRetention: 14;
    timeout: 15;
    memory: 192;
    preferences: {
      namingStyle: NamingStyle.CamelCase;
    };
  }>;

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

function testListener() {}
