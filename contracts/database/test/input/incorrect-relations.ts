import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    Database.UseTable<{
      name: 'testTable';
      relations: TestRelations;
      indexes: {};
      schema: {};
    }>
  ];
}

// Missing Database.Relations inheritance.
declare class TestRelations {}
