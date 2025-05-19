import type { Database, ParametersMode, TransactionMode, OrderMode } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: {
    parametersMode: ParametersMode.OnlyIndex;
    transactionMode: TransactionMode.Static;
    orderMode: OrderMode.AnyColumns;
    name: 'test';
  };

  tables: [
    {
      name: 'testTable';
      stream: TestStream;
      indexes: {};
      schema: {};
    }
  ];
}

// Missing Database.Stream inheritance.
declare class TestStream {
  handler: typeof streamHandler;
}

function streamHandler() {}
