import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: 'test';

  tables: [
    {
      name: 'testTable';
      relations: {
        // Only `string` is allowed for relations entries.
        foo: 123;
      };
      indexes: {};
      schema: {};
    }
  ];
}
