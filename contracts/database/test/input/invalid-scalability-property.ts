import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  scalability: Database.UseScalability<{
    maxCapacity: 1;
    minCapacity: 0;

    // No extra property is allowed.
    invalid_property: true;
  }>;

  tables: [];
}
