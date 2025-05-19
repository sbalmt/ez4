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
