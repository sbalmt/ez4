import type { Database, Client } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  client: Client<typeof this>;

  engine: TestEngine;

  tables: [];

  scalability: Database.UseScalability<{
    maxCapacity: 100;
    minCapacity: 0;
  }>;
}
