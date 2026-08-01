import type { Service, Environment } from '@ez4/common';
import type { Topic } from '@ez4/topic';
import type { Queue } from '@ez4/queue';

interface TestEvent extends Topic.Event, Queue.Message {
  foo: string;
}

export declare class TestTopic extends Topic.Unordered<TestEvent> {
  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof testHandler;
    }>
  ];

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfSettings: Environment.ServiceVariables;
  };
}

function testHandler(_request: Topic.Incoming<TestEvent>, context: Service.Context<TestTopic>) {
  const { selfSettings } = context;

  // Ensure variables are property referenced.
  selfSettings.TEST_VAR1;
  selfSettings.TEST_VAR2;
}
