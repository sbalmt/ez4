import type { NamingStyle } from '@ez4/schema';
import type { Ws } from '@ez4/gateway';

type TestData = {
  foo: string;
  bar: number;
};

export declare class TestService extends Ws.Service<TestData> {
  name: 'Test Service';

  routeKey: 'foo';

  defaults: Ws.UseDefaults<{
    listener: typeof testListener;
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
