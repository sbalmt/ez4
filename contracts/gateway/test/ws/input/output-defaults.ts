import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { NamingStyle } from '@ez4/schema';
import type { Ws } from '@ez4/gateway';

export declare class TestService extends Ws.Service<{}> {
  name: 'Test Service';

  defaults: Ws.UseDefaults<{
    listener: typeof testListener;
    files: ['path/to/file-a.txt', 'path/to/file-b.json'];
    architecture: ArchitectureType.Arm;
    runtime: RuntimeType.Node24;
    logLevel: LogLevel.Warning;
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
