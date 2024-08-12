import type { Database, Index } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  tables: [
    {
      name: 'testTable';
      schema: {};
      indexes: {
        // Index doesn't exists on schema.
        id: Index.Primary;
      };
    }
  ];
}
