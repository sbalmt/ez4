import type { Environment, Service } from '@ez4/common';
import type { Ws } from '@ez4/gateway';

type TestData = {
  foo: string;
  bar: number;
};

export declare class TestService extends Ws.Service<TestData> {
  routeKey: 'foo';

  connect: Ws.UseConnect<{
    handler: typeof connectHandler;
  }>;

  disconnect: Ws.UseDisconnect<{
    handler: typeof disconnectHandler;
  }>;

  message: Ws.UseMessage<{
    handler: typeof messageHandler;
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

function connectHandler(_request: Ws.EmptyRequest, context: Service.Context<TestService>) {
  const { selfSettings } = context;

  // Ensure variables are property referenced.
  selfSettings.TEST_VAR1;
  selfSettings.TEST_VAR2;
}

function disconnectHandler(_request: Ws.EmptyRequest, context: Service.Context<TestService>) {
  const { selfSettings } = context;

  // Ensure variables are property referenced.
  selfSettings.TEST_VAR1;
  selfSettings.TEST_VAR2;
}

declare class TestEvent implements Ws.Event {
  body: TestData;
}

function messageHandler(_request: Ws.Incoming<TestEvent>, context: Service.Context<TestService>) {
  const { selfSettings } = context;

  // Ensure variables are property referenced.
  selfSettings.TEST_VAR1;
  selfSettings.TEST_VAR2;

  // Variables in route scope
  process.env.TEST_VAR3;
}
