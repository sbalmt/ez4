import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    Database.UseTable<{
      name: 'testTable';
      stream: TestStream;
      indexes: {};
      schema: {};
    }>
  ];
}

// Missing Database.Stream inheritance.
declare class TestStream {
  handler: typeof streamHandler;
}

function streamHandler() {}
