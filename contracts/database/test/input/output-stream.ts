import type { Environment, Service, ArchitectureType, RuntimeType } from '@ez4/common';
import type { StreamAnyChange, Database, Client } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    Database.UseTable<{
      name: 'inlineTestTable';
      schema: TestSchema;
      indexes: {};
      stream: {
        handler: typeof streamHandler;
        architecture: ArchitectureType.Arm;
        logRetention: 14;
        timeout: 10;
        memory: 256;
      };
    }>,
    Database.UseTable<{
      name: 'testTable';
      schema: TestSchema;
      stream: TestStream;
      indexes: {};
    }>
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

  runtime: RuntimeType.Node24;

  variables: {
    TEST_VAR: 'test-literal-value';
  };
}

/**
 * Test table stream.
 */
async function streamHandler(_change: StreamAnyChange<TestSchema>, context: Service.Context<TestDatabase>) {
  context.selfClient.rawQuery;
  context.selfClient.testTable.findMany;
}
