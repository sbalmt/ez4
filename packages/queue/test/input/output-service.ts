import type { Environment } from '@ez4/common';
import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {}

/**
 * First test queue description.
 */
export declare class TestQueue1 extends Queue.Service<TestMessage> {
  subscriptions: [];

  order: true;

  // Services to all subscriptions.
  services: {
    testQueue: Environment.Service<TestQueue2>;
  };
}

/**
 * Description of the second test queue.
 */
export declare class TestQueue2 extends Queue.Service<TestMessage> {
  subscriptions: [];

  timeout: 5;

  retention: 60;

  polling: 10;

  delay: 15;

  // Variables to all subscriptions.
  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };
}
