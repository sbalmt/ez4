import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  scalability: TestScalability;

  tables: [];
}

// Concrete class is not allowed.
class TestScalability implements Database.Scalability {
  maxCapacity!: 1;
  minCapacity!: 0;
}
