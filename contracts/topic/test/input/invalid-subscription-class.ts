import type { Topic } from '@ez4/topic';

interface TestEvent extends Topic.Event {}

export declare class TestTopic extends Topic.Unordered<TestEvent> {
  subscriptions: [TestSubscription];
}

// Concrete class is not allowed.
class TestSubscription implements Topic.LambdaSubscription<TestEvent> {
  handler!: typeof testHandler;
}

function testHandler(request: Topic.Incoming<Topic.Event>) {
  request.event;
}
