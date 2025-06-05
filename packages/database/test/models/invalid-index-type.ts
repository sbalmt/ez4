import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines.js';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

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
