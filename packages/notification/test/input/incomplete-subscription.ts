import type { Notification } from '@ez4/notification';

interface TestMessage extends Notification.Message {}

export declare class TestNotification extends Notification.Service<TestMessage> {
  schema: {};

  // @ts-ignore Missing required subscription handler.
  subscriptions: [{}];
}
