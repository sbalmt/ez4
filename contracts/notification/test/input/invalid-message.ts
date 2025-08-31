import type { Notification } from '@ez4/notification';

// Concrete class is not allowed.
class TestMessage implements Notification.Message {}

export declare class TestNotification extends Notification.Service<TestMessage> {
  schema: TestMessage;

  subscriptions: [];
}
