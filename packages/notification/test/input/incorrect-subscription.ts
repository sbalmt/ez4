import type { Notification } from '@ez4/notification';

interface TestMessage extends Notification.Message {}

export declare class TestNotification extends Notification.Service<TestMessage> {
  subscriptions: [TestSubscription];
}

// Missing Notification.Subscription inheritance.
declare class TestSubscription {
  handler: typeof testHandler;
}

function testHandler(request: Notification.Incoming<Notification.Message>) {
  request.message;
}
