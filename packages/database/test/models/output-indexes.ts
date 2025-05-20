import type { Database, Index, ParametersMode, TransactionMode, PaginationMode, OrderMode } from '@ez4/database';

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
        bar: number;
        ttl: number;
      };
      indexes: {
        foo: Index.Primary;
        bar: Index.Secondary;
        ttl: Index.TTL;

        // Compound index.
        'foo:ttl': Index.Primary;
        'bar:foo': Index.Secondary;
      };
    },
    {
      name: 'testTable';
      schema: TestSchema;
      indexes: TestIndexes;
    }
  ];
}

declare class TestSchema implements Database.Schema {
  baz: string;

  qux: number;

  ttl: number;
}

declare class TestIndexes implements Database.Indexes {
  baz: Index.Primary;
  qux: Index.Secondary;
  ttl: Index.TTL;

  // Compound index.
  'baz:ttl': Index.Primary;
  'qux:baz': Index.Secondary;
}
