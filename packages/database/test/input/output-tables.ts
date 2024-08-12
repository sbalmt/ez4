import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service<[TestSchema1, TestSchema2]> {
  tables: [
    // Inline table.
    {
      name: 'inlineTestTable';
      schema: {};
      indexes: {};
    },

    // Table reference.
    TestTable
  ];
}

declare class TestSchema1 implements Database.Schema {
  id: string;

  foo: string;
}

declare class TestSchema2 implements Database.Schema {
  id: string;

  bar: string;
}

/**
 * Test table.
 */
declare class TestTable implements Database.Table<TestSchema2> {
  name: 'testTable';

  schema: TestSchema2;

  indexes: {};
}
