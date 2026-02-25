import type { ArchitectureType, LogLevel, RuntimeType } from '@ez4/project';
import type { Service, Environment } from '@ez4/common';
import type { Topic } from '@ez4/topic';
import type { Queue } from '@ez4/queue';

interface TestMessage extends Topic.Message, Queue.Message {
  foo: string;
}

/**
 * Topic to test subscriptions.
 */
export declare class TestTopic extends Topic.Service<TestMessage> {
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
      service: Environment.Service<TestQueue>;
    }>,

    // Lambda subscription reference.
    TestLambdaSubscription,

    // Queue subscription reference.
    TestQueueSubscription
  ];

  // Services to all subscriptions.
  services: {
    selfClient: Environment.Service<TestTopic>;
  };
}

declare class TestLambdaSubscription implements Topic.LambdaSubscription<TestMessage> {
  handler: typeof testHandler;

  runtime: RuntimeType.Node24;

  memory: 128;

  // Variable only for this subscription.
  variables: {
    TEST_VAR: 'test-literal-value';
  };
}

declare class TestQueue extends Queue.Service<TestMessage> {
  subscriptions: [];
}

declare class TestQueueSubscription implements Topic.QueueSubscription<TestMessage> {
  service: Environment.Service<TestQueue>;
}

function testHandler(request: Topic.Incoming<TestMessage>, context: Service.Context<TestTopic>) {
  const { selfClient } = context;

  // Ensure request types.
  const requestId: string = request.requestId;
  const message: TestMessage = request.message;

  console.log(requestId, message);

  // Ensure context types.
  selfClient.sendMessage({
    foo: 'test'
  });
}
