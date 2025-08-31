import type { Notification } from '@ez4/notification';

interface TestMessage extends Notification.Message {
  foo: string;
}

/**
 * Notification to test subscription listener.
 */
export declare class TestNotification extends Notification.Service<TestMessage> {
  subscriptions: [
    {
      listener: typeof testListener;
      handler: typeof testHandler;
    }
  ];
}

export function testListener(): void {}

export function testHandler(_request: Notification.Incoming<TestMessage>) {}
