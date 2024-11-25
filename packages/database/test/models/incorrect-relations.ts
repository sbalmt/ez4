import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: 'test';

  tables: [
    {
      name: 'testTable';
      relations: TestRelations;
      indexes: {};
      schema: {};
    }
  ];
}

// Missing Database.Relations inheritance.
declare class TestRelations {}
