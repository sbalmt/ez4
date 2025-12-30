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

function connectHandler() {}

function disconnectHandler() {}

// Missing Ws.Response inheritance.
interface MessageResponse {
  body: {
    status: boolean;
  };
}

function messageHandler(): MessageResponse {
  return {
    body: {
      status: true
    }
  };
}
