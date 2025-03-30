import type { Database, TransactionType } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: {
    transaction: TransactionType.Object;
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
