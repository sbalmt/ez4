import type { StreamChange, Database } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    {
      name: 'testTable';
      schema: TestSchema;
      indexes: {};
      stream: {
        handler: typeof streamHandler;
      };
    }
  ];

  variables: {
    TEST_VAR1: 'test-literal-value';
    TEST_VAR2: Environment.Variable<'TEST_ENV_VAR'>;
  };

  services: {
    selfSettings: Environment.ServiceVariables;
  };
}

declare class TestSchema implements Database.Schema {
  foo: string;
}

function streamHandler(_change: StreamChange<TestSchema>, context: Service.Context<TestDatabase>) {
  const { selfSettings } = context;

  // Ensure variables are property referenced.
  selfSettings.TEST_VAR1;
  selfSettings.TEST_VAR2;
}
