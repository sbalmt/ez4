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
      relations: {
        // Only `string` is allowed for relations entries.
        'foo:id': 123;
      };
      indexes: {};
      schema: {};
    }
  ];
}
