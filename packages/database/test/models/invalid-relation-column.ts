import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines.js';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    {
      name: 'testTable';
      indexes: {};
      relations: {
        // Column `random_id` doesn't exists on `testTable`
        'random_id@alias': 'testTable:id';
      };
      schema: {
        id: string;
      };
    }
  ];
}
