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

// Concrete class is not allowed.
class MessageResponse implements Ws.Response {
  body = {
    status: true
  };
}

function messageHandler(): MessageResponse {
  return {
    body: {
      status: true
    }
  };
}
