import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: 'test';

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
