import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service<TestEngine> {
  tables: [TestTable];
}

// Concrete class is not allowed.
class TestTable implements Database.Table<{}, TestEngine> {
  name!: 'testTable';
  schema!: {};
  indexes!: {};
}
