import type { StreamChange, Database, Client, TransactionMode, ParametersMode, OrderMode } from '@ez4/database';

declare class TestSchema implements Database.Schema {
  foo: string;
}

export declare class TestDatabase extends Database.Service {
  engine: {
    parametersMode: ParametersMode.OnlyIndex;
    transactionMode: TransactionMode.Static;
    orderMode: OrderMode.AnyColumns;
    name: 'test';
  };

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
