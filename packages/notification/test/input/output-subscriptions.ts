import type { Service, Environment } from '@ez4/common';
import type { Notification } from '@ez4/notification';
import type { Queue } from '@ez4/queue';

interface TestMessage extends Notification.Message, Queue.Message {
  foo: string;
}

/**
 * Notification to test subscriptions.
 */
export declare class TestNotification extends Notification.Service<TestMessage> {
  subscriptions: [
    // Inline lambda subscription.
    {
      handler: typeof testHandler;
      logRetention: 14;
      timeout: 15;
    },

    // Inline queue subscription.
    {
      service: Environment.Service<TestQueue>;
    },

    // Lambda subscription reference.
    TestLambdaSubscription,

    // Queue subscription reference.
    TestQueueSubscription
  ];

  // Services to all subscriptions.
  services: {
    selfClient: Environment.Service<TestNotification>;
  };
}

declare class TestLambdaSubscription implements Notification.LambdaSubscription<TestMessage> {
  handler: typeof testHandler;

  memory: 128;

  // Variable only for this subscription.
  variables: {
    TEST_VAR: 'test-literal-value';
  };
}

declare class TestQueue extends Queue.Service<TestMessage> {
  subscriptions: [];
}

declare class TestQueueSubscription implements Notification.QueueSubscription<TestMessage> {
  service: Environment.Service<TestQueue>;
}

function testHandler(request: Notification.Incoming<TestMessage>, context: Service.Context<TestNotification>) {
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
