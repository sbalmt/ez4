import type { Database, ParametersType, TransactionType } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: {
    parameters: ParametersType.OnlyIndex;
    transaction: TransactionType.Static;
    name: 'test';
  };

  tables: [
    {
      name: 'testTable';
      relations: {
        // Only `string` is allowed for relations entries.
        'foo:id': 123;
      };
      indexes: {};
      schema: {};
    }
  ];
}
