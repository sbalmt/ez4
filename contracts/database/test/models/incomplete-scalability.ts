import type { Database } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [];

  // @ts-ignore Incomplete scalability.
  scalability: {};
}
