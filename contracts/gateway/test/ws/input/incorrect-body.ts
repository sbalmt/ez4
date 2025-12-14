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

// Missing Ws.JsonBody inheritance.
interface TestBody {}

declare class TestRequest implements Ws.Request {
  body: TestBody;
}

function connectHandler() {}

function disconnectHandler() {}

function messageHandler(_request: Ws.Incoming<TestRequest>) {}
