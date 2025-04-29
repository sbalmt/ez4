import type { Database, ParametersType, TransactionType } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: {
    parameters: ParametersType.OnlyIndex;
    transaction: TransactionType.Static;
    name: 'test';
  };

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
