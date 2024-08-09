import type { Database } from '@ez4/database';

// @ts-ignore Missing required database name.
export declare class TestDatabase1 extends Database.Service {
  tables: [];
}

// @ts-ignore Missing required database tables.
export declare class TestDatabase2 extends Database.Service {
  name: 'Test Database 2';
}
