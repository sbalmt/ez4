import type { Database, Index, TransactionType } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: {
    transaction: TransactionType.Object;
    name: 'test';
  };

  tables: [
    {
      name: 'testTable';
      schema: {};
      indexes: {
        // Index doesn't exists on schema.
        id: Index.Primary;
      };
    }
  ];
}
