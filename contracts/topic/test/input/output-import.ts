import type { Environment, Service } from '@ez4/common';
import type { Topic } from '@ez4/topic';

interface TestMessage extends Topic.Message {
  foo: string;
}

export declare class TestTopic extends Topic.Service<TestMessage> {
  subscriptions: [];
}

function testHandler(request: Topic.Incoming<TestMessage>, context: Service.Context<TestImport1Topic>) {
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

/**
 * Import topic assigning handler.
 */
export declare class TestImport1Topic extends Topic.Import<TestTopic> {
  project: 'name from project in ez4.project.js';

  subscriptions: [
    Topic.UseSubscription<{
      handler: typeof testHandler;
    }>
  ];

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfClient: Environment.Service<TestImport1Topic>;
  };
}

/**
 * Import topic with no assigned handler.
 */
export declare class TestImport2Topic extends Topic.Import<TestTopic> {
  project: 'name from project in ez4.project.js';

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfClient: Environment.Service<TestImport2Topic>;
  };
}
