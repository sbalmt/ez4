import type { Service, Environment } from '@ez4/common';
import type { Topic } from '@ez4/topic';
import type { Queue } from '@ez4/queue';

interface TestMessage extends Topic.Message, Queue.Message {
  foo: string;
}

export declare class TestTopic extends Topic.Service<TestMessage> {
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
    selfSettings: Environment.Variables;
  };
}

function testHandler(_request: Topic.Incoming<TestMessage>, context: Service.Context<TestTopic>) {
  const { selfSettings } = context;

  // Ensure variables are property referenced.
  selfSettings.TEST_VAR1;
  selfSettings.TEST_VAR2;
}
