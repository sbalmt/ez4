import type { Database, Schema } from '@ez4/database';

/**
 * Database to test tables.
 */
export declare class TestDatabase extends Database.Service<TestSchema> {
  name: 'Test Database';

  tables: [
    {
      name: 'Test Table';
      schema: TestSchema;
    }
  ];
}

declare class TestSchema implements Database.Schema {
  primaryId: Schema.Primary<string>;

  indexedNumber: Schema.Index<number>;
}
