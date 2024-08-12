import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
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
