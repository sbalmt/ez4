import type { Environment, Service } from '@ez4/common';
import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {
  foo: string;
}

export declare class TestUnorderedQueue extends Queue.Unordered<TestMessage> {
  subscriptions: [];

  backoff: Queue.UseBackoff<{
    maxDelay: 90;
    minDelay: 15;
  }>;

  timeout: 20;

  polling: 10;
}

export declare class TestOrderedQueue extends Queue.Ordered<TestMessage> {
  subscriptions: [];

  fifoMode: Queue.UseFifoMode<{
    groupId: 'foo';
  }>;
}

function testHandler(request: Queue.Incoming<TestMessage>, context: Service.Context<TestImport1Queue>) {
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

/**
 * Import queue assigning handler.
 */
export declare class TestImport1Queue extends Queue.Import<TestUnorderedQueue> {
  project: 'name from project in ez4.project.js';

  subscriptions: [
    Queue.UseSubscription<{
      handler: typeof testHandler;
    }>
  ];

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfClient: Environment.Service<TestImport1Queue>;
  };
}

/**
 * Import queue with no assigned handler.
 */
export declare class TestImport2Queue extends Queue.Import<TestOrderedQueue> {
  project: 'name from project in ez4.project.js';

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfClient: Environment.Service<TestImport2Queue>;
  };
}
