import type { Environment, Service } from '@ez4/common';
import type { Notification } from '@ez4/notification';

interface TestMessage extends Notification.Message {
  foo: string;
}

export declare class TestNotification extends Notification.Service<TestMessage> {
  subscriptions: [];
}

function testHandler(
  request: Notification.Incoming<TestMessage>,
  context: Service.Context<TestImport1Notification>
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

/**
 * Import notification assigning handler.
 */
export declare class TestImport1Notification extends Notification.Import<TestNotification> {
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
    selfClient: Environment.Service<TestImport1Notification>;
  };
}

/**
 * Import notification with no assigned handler.
 */
export declare class TestImport2Notification extends Notification.Import<TestNotification> {
  project: 'name from project in ez4.project.js';

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfClient: Environment.Service<TestImport2Notification>;
  };
}
