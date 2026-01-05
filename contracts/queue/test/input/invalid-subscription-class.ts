import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {}

export declare class TestQueue extends Queue.Service<TestMessage> {
  subscriptions: [TestSubscription];
}

// Concrete class is not allowed.
class TestSubscription implements Queue.Subscription<TestMessage> {
  handler!: typeof testHandler;
}

function testHandler(request: Queue.Incoming<Queue.Message>) {
  request.message;
}
