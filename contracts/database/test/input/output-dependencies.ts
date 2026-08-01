import type { StreamAnyChange, Database, Client } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service<TestEngine> {
  client: Client<TestDatabase>;

  tables: [
    Database.UseTable<{
      name: 'inlineTestTable';
      schema: TestSchema;
      indexes: {};
      stream: {
        handler: typeof streamHandler;
      };
    }>
  ];

  services: {
    selfOptions: Environment.ServiceOptions;
    selfVariables: Environment.ServiceVariables;
    selfClient: Environment.Service<TestDatabase>;
  };
}

declare class TestSchema implements Database.Schema {
  foo: string;
}

async function streamHandler(_change: StreamAnyChange<TestSchema>, { selfOptions, selfVariables }: Service.Context<TestDatabase>) {
  selfVariables;
  selfOptions;
}
