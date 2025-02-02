import type { Service, Environment } from '@ez4/common';
import type { Notification } from '@ez4/notification';

interface TestMessage extends Notification.Message {
  foo: string;
}

/**
 * Notification to test subscriptions.
 */
export declare class TestNotification extends Notification.Service<TestMessage> {
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
    selfClient: Environment.Service<TestNotification>;
  };
}

declare class TestSubscription implements Notification.Subscription<TestMessage> {
  handler: typeof testHandler;

  memory: 128;

  // Variable only for this subscription.
  variables: {
    TEST_VAR: 'test-literal-value';
  };
}

function testHandler(
  request: Notification.Incoming<TestMessage>,
  context: Service.Context<TestNotification>
) {
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
