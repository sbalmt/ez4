import type { Database, TransactionType } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: {
    transaction: TransactionType.Object;
    name: 'test';
  };

  tables: [
    {
      name: 'testTable';
      schema: TestSchema;
      indexes: {};
    }
  ];
}

// Concrete class is not allowed.
class TestSchema implements Database.Schema {}
