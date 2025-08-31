import type { Notification } from '@ez4/notification';

// Missing Notification.Message inheritance.
declare class TestMessage {}

export declare class TestNotification extends Notification.Service<TestMessage> {
  schema: TestMessage;

  subscriptions: [];
}
