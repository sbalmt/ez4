import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    {
      name: 'testTable';
      schema: TestSchema;
      indexes: {};
    }
  ];
}

// Concrete class is not allowed.
class TestSchema implements Database.Schema {}
