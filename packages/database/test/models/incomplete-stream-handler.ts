import type { Database, TransactionType } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: {
    transaction: TransactionType.Object;
    name: 'test';
  };

  tables: [
    {
      name: 'testTable';
      schema: {};
      indexes: {};
      stream: {
        handler: typeof testHandler;
      };
    }
  ];
}

function testHandler() {}
