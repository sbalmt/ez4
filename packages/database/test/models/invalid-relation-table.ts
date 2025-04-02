import type { Database, TransactionType } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: {
    transaction: TransactionType.Static;
    name: 'test';
  };

  tables: [
    {
      name: 'testTable';
      schema: {
        id: string;
      };
      relations: {
        // Table `foo` doesn't exists on the database.
        'id@alias': 'foo:id';
      };
      indexes: {};
    }
  ];
}
