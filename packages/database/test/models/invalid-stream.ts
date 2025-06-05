import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines.js';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    {
      name: 'testTable';
      schema: {};
      indexes: {};
      stream: TestStream;
    }
  ];
}

// Concrete class is not allowed.
class TestStream implements Database.Stream {
  handler!: typeof streamHandler;
}

function streamHandler() {}
