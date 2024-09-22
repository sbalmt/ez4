import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {}

export declare class TestQueue extends Queue.Service<TestMessage> {
  subscriptions: [TestSubscription];
}

// Missing Queue.Subscription inheritance.
declare class TestSubscription {
  handler: typeof testHandler;
}

function testHandler(request: Queue.Incoming<Queue.Message>) {
  request.message;
}
