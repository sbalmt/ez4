import type { Database, TransactionType } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: {
    transaction: TransactionType.Static;
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

// Missing Database.Schema inheritance.
declare class TestSchema {}
