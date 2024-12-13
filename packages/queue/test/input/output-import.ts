import type { Environment, Service } from '@ez4/common';
import type { Queue } from '@ez4/queue';

interface TestMessage extends Queue.Message {
  foo: string;
}

export declare class TestQueue extends Queue.Service<TestMessage> {
  subscriptions: [];

  timeout: 20;

  polling: 10;
}

function testHandler(
  request: Queue.Incoming<TestMessage>,
  context: Service.Context<TestImport1Queue>
) {
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
export declare class TestImport1Queue extends Queue.Import<TestQueue> {
  project: 'name from project in ez4.project.js';

  subscriptions: [
    {
      handler: typeof testHandler;
    }
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
export declare class TestImport2Queue extends Queue.Import<TestQueue> {
  project: 'name from project in ez4.project.js';

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfClient: Environment.Service<TestImport2Queue>;
  };
}
