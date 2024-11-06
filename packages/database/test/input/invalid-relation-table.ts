import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: 'test';

  tables: [
    {
      name: 'testTable';
      relations: {
        // Table `foo` doesn't exists on the database.
        foo: 'alias@id';
      };
      indexes: {};
      schema: {};
    }
  ];
}
