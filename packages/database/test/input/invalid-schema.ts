import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  name: 'Test Database';

  tables: [
    {
      name: 'Test Table';
      schema: TestSchema;
    }
  ];
}

// Concrete class is not allowed.
class TestSchema implements Database.Schema {}
