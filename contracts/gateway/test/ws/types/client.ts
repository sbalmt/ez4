import type { Environment, Service } from '@ez4/common';
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

  services: {
    selfClient: Environment.Service<TestService>;
  };
}

function connectHandler() {}

function disconnectHandler() {}

async function messageHandler(_request: Ws.EmptyRequest, context: Service.Context<TestService>) {
  const { selfClient } = context;

  await selfClient.sendMessage('foo-bar', {
    foo: 'foo',
    bar: 123
  });
}
