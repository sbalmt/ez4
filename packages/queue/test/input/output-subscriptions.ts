import type { Service, Environment } from '@ez4/common';
import type { Queue } from '@ez4/queue';

declare class TestMessage implements Queue.Message {
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
    },

    // Subscription reference.
    TestSubscription
  ];

  // Services to all subscriptions.
  services: {
    selfClient: Environment.Service<TestQueue>;
  };
}

export declare class TestSubscription implements Queue.Subscription<TestMessage> {
  handler: typeof testHandler;

  memory: 128;

  // Variable only for this subscription.
  variables: {
    TEST_VAR: 'test-literal-value';
  };
}

export function testHandler(
  request: Queue.Incoming<TestMessage>,
  context: Service.Context<TestQueue>
) {
  // Ensure request types.
  request.requestId;
  request.message;

  // Ensure context types.
  context.selfClient.receiveMessage;
  context.selfClient.sendMessage;
}
