import type { Database } from '@ez4/database';

declare class TestSchema implements Database.Schema {
  id: string;
}

/**
 * Database to test tables.
 */
export declare class TestDatabase extends Database.Service<TestSchema> {
  name: 'Test Database';

  tables: [
    // Inline table.
    {
      name: 'Inline Table';
      schema: TestSchema;
    },

    // Table reference.
    TestTable
  ];
}

export declare class TestTable implements Database.Table<TestSchema> {
  name: 'Test Table';

  schema: TestSchema;
}
