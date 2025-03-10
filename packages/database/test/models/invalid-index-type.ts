import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: 'test';

  tables: [
    {
      name: 'testTable';
      schema: {};
      indexes: {
        // Indexes must follow one Index options.
        id: 'random value';
      };
    }
  ];
}
