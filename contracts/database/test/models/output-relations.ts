import type { Database, Index } from '@ez4/database';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  tables: [
    {
      name: 'parentTestTable';
      schema: {
        id: string;
      };
      relations: {
        'id@children': 'childTestTable:parent_id';
      };
      indexes: {
        id: Index.Primary;
      };
    },
    {
      name: 'childTestTable';
      schema: {
        id: string;
        parent_id: string;
      };
      relations: {
        'parent_id@parent': 'parentTestTable:id';
      };
      indexes: {
        id: Index.Primary;
        parent_id: Index.Secondary;
      };
    }
  ];
}
