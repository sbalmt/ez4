import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service<[TestSchema]> {
  engine: 'test';

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
