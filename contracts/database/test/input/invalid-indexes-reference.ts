import type { Database, Index } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    Database.UseTable<{
      name: 'testTable';
      schema: {};
      indexes: {
        // Index doesn't exists on schema.
        id: Index.Primary;
      };
    }>
  ];
}
