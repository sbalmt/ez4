import type { Ws } from '@ez4/gateway';

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

type TestEvent = {
  invalid_property: true;
};

// @ts-expect-error No extra property is allowed
function connectHandler(_request: Ws.Incoming<TestEvent>) {}

function disconnectHandler() {}

function messageHandler() {}
