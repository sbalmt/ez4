import type { Environment } from '@ez4/common';
import type { Queue } from '@ez4/queue';

/**
 * First test queue description.
 */
export declare class TestQueue1 extends Queue.Service {
  name: 'Test Queue 1';

  schema: {};

  subscriptions: [];

  // Services to all subscriptions.
  services: {
    testQueue: Environment.Service<TestQueue2>;
  };
}

/**
 * Description of the second test queue.
 */
export declare class TestQueue2 extends Queue.Service {
  name: 'Test Queue 2';

  schema: {};

  subscriptions: [];

  // Variables to all subscriptions.
  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };
}
