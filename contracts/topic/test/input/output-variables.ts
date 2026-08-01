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
    selfVariables: Environment.ServiceVariables;
  };
}

function testHandler(_request: Topic.Incoming<TestEvent>, context: Service.Context<TestTopic>) {
  const { selfVariables } = context;

  // Ensure variables are property referenced.
  selfVariables.TEST_VAR1;
  selfVariables.TEST_VAR2;
}
