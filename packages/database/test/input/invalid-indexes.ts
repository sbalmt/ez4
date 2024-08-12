import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  tables: [
    {
      name: 'testTable';
      schema: {};
      indexes: TestIndexes;
    }
  ];
}

// Concrete class is not allowed.
class TestIndexes implements Database.Indexes {}
