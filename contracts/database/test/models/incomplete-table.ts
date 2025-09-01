import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  // @ts-ignore Missing required table name and schema.
  tables: [{}];
}
