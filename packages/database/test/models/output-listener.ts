import type { StreamChange, Database, Client } from '@ez4/database';
import type { TestEngine } from '../common/engines.js';

declare class TestSchema implements Database.Schema {
  foo: string;
}

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    {
      name: 'inlineTestTable';
      schema: TestSchema;
      indexes: {};
      stream: {
        listener: typeof streamListener;
        handler: typeof streamHandler;
      };
    }
  ];

  client: Client<TestDatabase>;
}

export async function streamListener() {}

export async function streamHandler(_change: StreamChange<TestSchema>) {}
