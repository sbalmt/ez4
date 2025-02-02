import type { Notification } from '@ez4/notification';

interface TestMessage extends Notification.Message {}

// Missing handler incoming message.
function testHandler() {}

export declare class TestNotification extends Notification.Service<TestMessage> {
  // @ts-ignore Missing required subscription handler.
  subscriptions: [
    {
      handler: typeof testHandler;
    }
  ];
}
