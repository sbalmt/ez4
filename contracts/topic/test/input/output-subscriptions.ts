import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { Service, Environment } from '@ez4/common';
import type { Topic } from '@ez4/topic';
import type { Queue } from '@ez4/queue';

interface TestEvent extends Topic.Event, Queue.Message {
  foo: string;
}

/**
 * @description Topic to test subscriptions.
 */
export declare class TestTopic extends Topic.Unordered<TestEvent> {
  subscriptions: [
    // Inline lambda subscription.
    Topic.UseSubscription<{
      handler: typeof testHandler;
      architecture: ArchitectureType.Arm;
      logLevel: LogLevel.Information;
      logRetention: 14;
      timeout: 15;
    }>,

    // Inline queue subscription.
    Topic.UseSubscription<{
      service: Environment.Service<TestOrderedQueue>;
    }>,

    // Lambda subscription reference.
    TestLambdaSubscription,

    // Queue subscription reference.
    TestUnorderedQueueSubscription
  ];

  // Services to all subscriptions.
  services: {
    selfClient: Environment.Service<TestTopic>;
  };
}

declare class TestLambdaSubscription implements Topic.LambdaSubscription<TestEvent> {
  handler: typeof testHandler;

  runtime: RuntimeType.Node24;

  memory: 128;

  files: ['path/to/file-a.txt', 'path/to/file-b.json'];

  debug: true;

  // Variable only for this subscription.
  variables: {
    TEST_VAR: 'test-literal-value';
  };
}

declare class TestOrderedQueue extends Queue.Ordered<TestEvent> {
  subscriptions: [];

  fifoMode: {
    groupId: 'foo';
  };
}

declare class TestUnorderedQueueSubscription implements Topic.QueueSubscription<TestEvent> {
  service: Environment.Service<TestUnorderedQueue>;
}

declare class TestUnorderedQueue extends Queue.Unordered<TestEvent> {
  subscriptions: [];
}

function testHandler(request: Topic.Incoming<TestEvent>, context: Service.Context<TestTopic>) {
  const { selfClient } = context;

  // Ensure request types.
  const requestId: string = request.requestId;
  const event: TestEvent = request.event;

  console.log(requestId, event);

  // Ensure context types.
  selfClient.publishEvent({
    foo: 'test'
  });
}
