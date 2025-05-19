import type { Database, ParametersMode, TransactionMode, OrderMode } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: {
    parametersMode: ParametersMode.OnlyIndex;
    transactionMode: TransactionMode.Static;
    orderMode: OrderMode.AnyColumns;
    name: 'test';
  };

  // @ts-ignore Incomplete stream, missing handler.
  tables: [
    {
      name: 'testTable';
      schema: {};
      indexes: {};
      stream: {};
    }
  ];
}
