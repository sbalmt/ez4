import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    // Inline table.
    Database.UseTable<{
      name: 'inlineTestTable';
      schema: TestSchema1;
      indexes: {};
    }>,

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
