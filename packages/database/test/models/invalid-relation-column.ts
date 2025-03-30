import type { Database, TransactionType } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: {
    transaction: TransactionType.Object;
    name: 'test';
  };

  tables: [
    {
      name: 'testTable';
      indexes: {};
      relations: {
        // Column `random_id` doesn't exists on `testTable`
        'random_id@alias': 'testTable:id';
      };
      schema: {
        id: string;
      };
    }
  ];
}
