import type { Environment, Service } from '@ez4/common';
import type { Http, Ws } from '@ez4/gateway';

type TestEvent = {
  foo: string;
  bar: number;
};

export declare class TestService extends Ws.Service<TestEvent> {
  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  data: Ws.UseData<{
    handler: typeof dataHandler;
    variables: {
      TEST_VAR3: 'test-literal-data-value';
    };
  }>;

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfSettings: Environment.ServiceVariables;
  };
}

function connectHandler(_request: Http.EmptyRequest, context: Service.Context<TestService>): Http.SuccessEmptyResponse {
  const { selfSettings } = context;

  // Ensure variables are property referenced.
  selfSettings.TEST_VAR1;
  selfSettings.TEST_VAR2;

  return {
    status: 204
  };
}

function disconnectHandler(_request: Ws.Incoming<null>, context: Service.Context<TestService>) {
  const { selfSettings } = context;

  // Ensure variables are property referenced.
  selfSettings.TEST_VAR1;
  selfSettings.TEST_VAR2;
}

function dataHandler(_request: Ws.Incoming<TestEvent>, context: Service.Context<TestService>) {
  const { selfSettings } = context;

  // Ensure variables are property referenced.
  selfSettings.TEST_VAR1;
  selfSettings.TEST_VAR2;

  // Variables in route scope
  process.env.TEST_VAR3;
}
