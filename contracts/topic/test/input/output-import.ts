import type { Environment, Service } from '@ez4/common';
import type { Topic } from '@ez4/topic';

interface TestEvent extends Topic.Event {
  foo: string;
}

export declare class TestUnorderedTopic extends Topic.Unordered<TestEvent> {
  subscriptions: [];
}

export declare class TestOrderedTopic extends Topic.Ordered<TestEvent> {
  subscriptions: [];

  fifoMode: {
    groupId: 'foo';
  };
}

function testHandler(request: Topic.Incoming<TestEvent>, context: Service.Context<TestImport1Topic>) {
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

/**
 * @description Import topic assigning handler.
 */
export declare class TestImport1Topic extends Topic.Import<TestUnorderedTopic> {
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
 * @description Import topic with no assigned handler.
 */
export declare class TestImport2Topic extends Topic.Import<TestOrderedTopic> {
  project: 'name from project in ez4.project.js';

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfClient: Environment.Service<TestImport2Topic>;
  };
}
