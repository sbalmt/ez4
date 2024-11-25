import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: 'test';

  tables: [
    {
      name: 'testTable';
      schema: {
        id: string;
      };
      relations: {
        // Table `foo` doesn't exists on the database.
        'foo:id': 'id@alias';
      };
      indexes: {};
    }
  ];
}
