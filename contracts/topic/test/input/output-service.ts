import type { Environment } from '@ez4/common';
import type { Topic } from '@ez4/topic';

interface TestMessage extends Topic.Message {
  id: string;
  user: string;
}

/**
 * First test topic description.
 */
export declare class TestTopic1 extends Topic.Service<TestMessage> {
  subscriptions: [];

  fifoMode: Topic.UseFifoMode<{
    uniqueId: 'id';
    groupId: 'user';
  }>;

  // Services to all subscriptions.
  services: {
    testTopic: Environment.Service<TestTopic2>;
  };
}

/**
 * Description of the second test topic.
 */
export declare class TestTopic2 extends Topic.Service<TestMessage> {
  subscriptions: [];

  // Variables to all subscriptions.
  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };
}
