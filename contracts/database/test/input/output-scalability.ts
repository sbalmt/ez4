import type { Database, Client } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service<TestEngine> {
  client: Client<typeof this>;

  tables: [];

  scalability: Database.UseScalability<{
    maxCapacity: 100;
    minCapacity: 0;
  }>;
}
