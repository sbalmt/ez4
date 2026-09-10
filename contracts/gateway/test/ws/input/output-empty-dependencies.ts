import type { Service } from '@ez4/common';
import type { Ws } from '@ez4/gateway';

type TestData = {
  value: string;
};

export declare class TestService extends Ws.Service<TestData> {
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

function connectHandler(_event: Ws.Incoming<Ws.EmptyEvent>, {}: Service.Context<TestService>) {}

function disconnectHandler(_event: Ws.Incoming<Ws.EmptyEvent>, {}: Service.Context<TestService>) {}

function messageHandler(_event: Ws.Incoming<Ws.EmptyRequest>, {}: Service.Context<TestService>) {}
