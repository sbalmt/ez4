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
      indexes: {};
      relations: {
        // Column `random_id` doesn't exists on `testTable`
        'random_id@alias': 'testTable:id';
      };
      schema: {
        id: string;
      };
    }
  ];
}
