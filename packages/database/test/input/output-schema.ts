import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service<[TestSchema]> {
  engine: 'test';

  tables: [
    {
      name: 'inlineTestTable';
      schema: {
        foo: string;
      };
      indexes: {};
    },
    {
      name: 'testTable';
      schema: TestSchema;
      indexes: {};
    }
  ];
}

declare class TestSchema implements Database.Schema {
  bar: string;

  baz: number;
}
