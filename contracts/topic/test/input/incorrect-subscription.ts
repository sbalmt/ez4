import type { Topic } from '@ez4/topic';

interface TestMessage extends Topic.Message {}

export declare class TestTopic extends Topic.Service<TestMessage> {
  subscriptions: [TestSubscription];
}

// Missing Topic.Subscription inheritance.
declare class TestSubscription {
  handler: typeof testHandler;
}

function testHandler(request: Topic.Incoming<Topic.Message>) {
  request.message;
}
