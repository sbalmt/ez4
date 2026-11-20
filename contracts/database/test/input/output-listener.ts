import type { StreamAnyChange, Database, Client } from '@ez4/database';
import type { TestEngine } from '../common/engines';

declare class TestSchema implements Database.Schema {
  foo: string;
}

export declare class TestDatabase extends Database.Service<TestEngine> {
  tables: [
    Database.UseTable<{
      name: 'inlineTestTable';
      schema: TestSchema;
      indexes: {};
      stream: {
        handler: typeof streamHandler;
        listener: typeof streamListener;
      };
    }>
  ];

  client: Client<TestDatabase>;
}

async function streamListener() {}

async function streamHandler(_change: StreamAnyChange<TestSchema>) {}
