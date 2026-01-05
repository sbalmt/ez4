import type { Ws } from '@ez4/gateway';

export declare class TestService extends Ws.Service<{}> {
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

declare class MessageResponse implements Ws.Response {
  body: {
    status: boolean;
  };

  // No extra property is allowed.
  invalid_property: true;
}

function messageHandler(): MessageResponse {
  return {
    invalid_property: true,
    body: {
      status: true
    }
  };
}
