import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: 'test';

  // @ts-ignore Missing required table name and schema.
  tables: [{}];
}
