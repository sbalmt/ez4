import type { StreamChange, Database, Client } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';

export declare class TestDatabase extends Database.Service<[TestSchema]> {
  engine: 'test';

  tables: [
    {
      name: 'inlineTestTable';
      schema: TestSchema;
      indexes: {};
      stream: {
        handler: typeof streamHandler;
        timeout: 10;
        memory: 256;
      };
    },
    {
      name: 'testTable';
      schema: TestSchema;
      stream: TestStream;
      indexes: {};
    }
  ];

  // Services to all streams.
  services: {
    selfClient: Environment.Service<TestDatabase>;
  };

  client: Client<TestDatabase>;
}

declare class TestSchema implements Database.Schema {
  foo: string;
}

declare class TestStream implements Database.Stream<TestSchema> {
  handler: typeof streamHandler;

  variables: {
    TEST_VAR: 'test-literal-value';
  };
}

/**
 * Test table stream.
 */
export async function streamHandler(
  _change: StreamChange<TestSchema>,
  context: Service.Context<TestDatabase>
) {
  context.selfClient.rawQuery;
  context.selfClient.testTable.findMany;
}
