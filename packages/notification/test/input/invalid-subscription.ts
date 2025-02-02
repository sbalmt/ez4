import type { Notification } from '@ez4/notification';

interface TestMessage extends Notification.Message {}

export declare class TestNotification extends Notification.Service<TestMessage> {
  subscriptions: [TestSubscription];
}

// Concrete class is not allowed.
class TestSubscription implements Notification.Subscription<TestMessage> {
  handler!: typeof testHandler;
}

function testHandler(request: Notification.Incoming<Notification.Message>) {
  request.message;
}
