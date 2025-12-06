import type { Http, Ws } from '@ez4/gateway';

type TestEvent = {
  foo: string;
  bar: number;
};

export declare class TestService extends Ws.Service<TestEvent> {
  routeKey: 'foo';

  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
    listener: typeof testListener;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
    listener: typeof testListener;
  }>;

  data: Ws.UseData<{
    handler: typeof dataHandler;
    listener: typeof testListener;
  }>;
}

function connectHandler(_request: Http.EmptyRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}

function disconnectHandler(_request: Ws.Incoming<null>) {}

function dataHandler(_request: Ws.Incoming<TestEvent>) {}

function testListener(): void {}
