import type { Database, Index } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: 'test';

  tables: [
    {
      name: 'parentTestTable';
      schema: {
        id: string;
      };
      relations: {
        'childTestTable:parent_id': 'id@children';
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
        'parentTestTable:id': 'parent_id@parent';
      };
      indexes: {
        id: Index.Primary;
        parent_id: Index.Secondary;
      };
    }
  ];
}
