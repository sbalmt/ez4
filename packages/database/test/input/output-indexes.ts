import type { Database, Index } from '@ez4/database';

export declare class TestDatabase extends Database.Service<[TestSchema]> {
  engine: 'test';

  tables: [
    {
      name: 'inlineTestTable';
      schema: {
        foo: string;
        bar: number;
        ttl: number;
      };
      indexes: {
        foo: Index.Primary;
        bar: Index.Regular;
        ttl: Index.TTL;

        // Compound index.
        'foo:ttl': Index.Regular;
        'bar:foo': Index.Secondary;
      };
    },
    {
      name: 'testTable';
      schema: TestSchema;
      indexes: TestIndexes;
    }
  ];
}

declare class TestSchema implements Database.Schema {
  baz: string;

  qux: number;

  ttl: number;
}

declare class TestIndexes implements Database.Indexes<TestSchema> {
  baz: Index.Primary;
  qux: Index.Regular;
  ttl: Index.TTL;

  // Compound index.
  'baz:ttl': Index.Regular;
  'qux:baz': Index.Secondary;
}
