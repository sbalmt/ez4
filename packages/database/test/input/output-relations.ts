import type { Database, Index } from '@ez4/database';

export declare class TestDatabase extends Database.Service<[TestSchema]> {
  engine: 'test';

  tables: [
    {
      name: 'inlineTestTable';
      schema: {
        foo: string;
      };
      relations: {
        testTable: 'test@bar';
      };
      indexes: {
        foo: Index.Primary;
      };
    },
    {
      name: 'testTable';
      schema: TestSchema;
      indexes: {
        bar: Index.Primary;
      };
    }
  ];
}

declare class TestSchema implements Database.Schema {
  bar: string;
}
