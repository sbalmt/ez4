import type { Database, Index } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    {
      name: 'table_a';
      schema: {
        id: string;
        value: number;
      };
      indexes: {
        id: Index.Primary;
      };
    },
    {
      name: 'table_b';
      schema: {
        id: string;
        value: string;
      };
      indexes: {
        id: Index.Primary;
      };
    }
  ];
}
