import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
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
