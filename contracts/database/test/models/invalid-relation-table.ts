import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines.js';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    {
      name: 'testTable';
      schema: {
        id: string;
      };
      relations: {
        // Table `foo` doesn't exists on the database.
        'id@alias': 'foo:id';
      };
      indexes: {};
    }
  ];
}
