import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: 'test';

  tables: [
    {
      name: 'testTable';
      indexes: {};
      relations: {
        // Column `random_id` doesn't exists on `testTable`
        testTable: 'foo@random_id';
      };
      schema: {
        id: string;
      };
    }
  ];
}
