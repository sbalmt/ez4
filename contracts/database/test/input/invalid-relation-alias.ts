import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service<TestEngine> {
  tables: [
    Database.UseTable<{
      name: 'testTable';
      schema: {
        id: string;
        alias: string;
      };
      relations: {
        // Alias `alias` is already a column on the target table.
        'id@alias': 'otherTable:id';
      };
      indexes: {};
    }>,
    Database.UseTable<{
      name: 'otherTable';
      schema: {
        id: string;
      };
      indexes: {};
    }>
  ];
}
