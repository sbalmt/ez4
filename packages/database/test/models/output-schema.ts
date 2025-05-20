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
      name: 'inlineTestTable';
      schema: {
        foo: string;
      };
      indexes: {};
    },
    {
      name: 'testTable';
      schema: TestSchema;
      indexes: {};
    }
  ];
}

declare class TestSchema implements Database.Schema {
  foo: string;

  bar: number;

  baz: {
    nested: boolean;
  };

  qux: {
    [key: string]: number;
  };
}
