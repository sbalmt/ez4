import type { Database } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  // @ts-ignore Incomplete stream, missing handler.
  tables: [
    {
      name: 'testTable';
      schema: {};
      indexes: {};
      stream: {};
    }
  ];
}
