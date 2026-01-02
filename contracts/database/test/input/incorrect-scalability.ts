import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  scalability: TestScalability;

  tables: [];
}

// Missing Database.Scalability inheritance.
declare class TestScalability {
  maxCapacity: 1;
  minCapacity: 0;
}
