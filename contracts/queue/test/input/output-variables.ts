import type { Environment, Service } from '@ez4/common';
import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {
  foo: string;
}

export declare class TestQueue extends Queue.Service<TestMessage> {
  subscriptions: [
    {
      handler: typeof testHandler;
    }
  ];

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfSettings: Environment.ServiceVariables;
  };
}

function testHandler(_request: Queue.Incoming<TestMessage>, context: Service.Context<TestQueue>) {
  const { selfSettings } = context;

  // Ensure variables are property referenced.
  selfSettings.TEST_VAR1;
  selfSettings.TEST_VAR2;
}
