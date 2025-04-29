import type { Database, ParametersType, TransactionType } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: {
    parameters: ParametersType.OnlyIndex;
    transaction: TransactionType.Static;
    name: 'test';
  };

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
