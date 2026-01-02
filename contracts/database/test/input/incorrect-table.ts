import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [TestTable];
}

// Missing Database.Table inheritance.
declare class TestTable {
  name: 'testTable';
  schema: {};
  indexes: {};
}
