import type { Environment } from '@ez4/common';
import type { Notification } from '@ez4/notification';

interface TestMessage extends Notification.Message {}

/**
 * First test notification description.
 */
export declare class TestNotification1 extends Notification.Service<TestMessage> {
  subscriptions: [];

  // Services to all subscriptions.
  services: {
    testNotification: Environment.Service<TestNotification2>;
  };
}

/**
 * Description of the second test notification.
 */
export declare class TestNotification2 extends Notification.Service<TestMessage> {
  subscriptions: [];

  // Variables to all subscriptions.
  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };
}
