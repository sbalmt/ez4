import type { Http, Ws } from '@ez4/gateway';

type TestEvent = {
  foo: string;
  bar: number;
};

/**
 * First test service description.
 */
export declare class TestService1 extends Ws.Service<TestEvent> {
  name: 'Test Service 1';

  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  data: Ws.UseData<{
    handler: typeof dataHandler;
  }>;
}

/**
 * Description of the second test service.
 */
export declare class TestService2 extends Ws.Service<TestEvent> {
  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  data: Ws.UseData<{
    handler: typeof dataHandler;
  }>;
}

function connectHandler(_request: Http.EmptyRequest): Http.SuccessEmptyResponse {
  return {
    status: 204
  };
}

function disconnectHandler(_request: Ws.Incoming<null>) {}

function dataHandler(_request: Ws.Incoming<TestEvent>) {}
