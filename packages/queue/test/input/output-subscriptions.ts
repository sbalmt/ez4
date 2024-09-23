import type { Service, Environment } from '@ez4/common';
import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {
  foo: string;
}

/**
 * Queue to test subscriptions.
 */
export declare class TestQueue extends Queue.Service<TestMessage> {
  subscriptions: [
    // Inline subscription.
    {
      handler: typeof testHandler;

      concurrency: 2;
    },

    // Subscription reference.
    TestSubscription
  ];

  // Services to all subscriptions.
  services: {
    selfClient: Environment.Service<TestQueue>;
  };
}

declare class TestSubscription implements Queue.Subscription<TestMessage> {
  handler: typeof testHandler;

  memory: 128;

  // Variable only for this subscription.
  variables: {
    TEST_VAR: 'test-literal-value';
  };
}

function testHandler(request: Queue.Incoming<TestMessage>, context: Service.Context<TestQueue>) {
  const { selfClient } = context;

  // Ensure request types.
  const requestId: string = request.requestId;
  const message: TestMessage = request.message;

  console.log(requestId, message);

  // Ensure context types.
  selfClient.receiveMessage({
    messages: 1,
    polling: 5
  });

  selfClient.sendMessage({
    foo: 'test'
  });
}
