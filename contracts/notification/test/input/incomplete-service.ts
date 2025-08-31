import type { Notification } from '@ez4/notification';

interface TestMessage extends Notification.Message {}

// @ts-ignore Missing required notification subscriptions.
export declare class TestNotification1 extends Notification.Service<TestMessage> {}

// @ts-ignore Missing required notification schema.
export declare class TestNotification2 extends Notification.Service {
  subscriptions: [];
}
