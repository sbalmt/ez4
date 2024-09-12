import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  tables: [
    {
      name: 'testTable';
      schema: {};
      indexes: {};
      stream: TestStream;
    }
  ];
}

// Missing Database.Stream inheritance.
declare class TestStream {
  handler: typeof streamHandler;
}

function streamHandler() {}
