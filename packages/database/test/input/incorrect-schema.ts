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

// Missing Database.Schema inheritance.
declare class TestSchema {}
