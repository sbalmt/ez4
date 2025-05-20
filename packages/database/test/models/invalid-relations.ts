import type { Database, ParametersMode, TransactionMode, PaginationMode, OrderMode } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: {
    parametersMode: ParametersMode.OnlyIndex;
    transactionMode: TransactionMode.Static;
    paginationMode: PaginationMode.Offset;
    orderMode: OrderMode.AnyColumns;
    name: 'test';
  };

  tables: [
    {
      name: 'testTable';
      relations: TestRelations;
      indexes: {};
      schema: {};
    }
  ];
}

// Concrete class is not allowed.
class TestRelations implements Database.Relations {}
