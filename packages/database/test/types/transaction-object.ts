import type { Client, Database, Index, TransactionType } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';

declare class TestTable implements Database.Schema {
  id: string;
  value: number;
}

export declare class TestDatabase extends Database.Service {
  engine: {
    transaction: TransactionType.Object;
    name: 'test';
  };

  client: Client<TestDatabase>;

  tables: [
    {
      name: 'table';
      schema: TestTable;
      indexes: {
        id: Index.Primary;
        value: Index.Unique;
      };
    }
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export async function testHandler({ selfClient }: Service.Context<TestDatabase>) {
  testInsert(selfClient);
  testUpdate(selfClient);
  testDelete(selfClient);
}

const testInsert = (client: TestDatabase['client']) => {
  return client.transaction({
    table: [
      {
        insert: {
          data: {
            id: 'foo',
            value: 123
          }
        }
      }
    ]
  });
};

const testUpdate = (client: TestDatabase['client']) => {
  return client.transaction({
    table: [
      {
        update: {
          data: {
            value: 123
          },
          where: {
            id: 'foo'
          }
        }
      }
    ]
  });
};

const testDelete = (client: TestDatabase['client']) => {
  return client.transaction({
    table: [
      {
        delete: {
          where: {
            id: 'foo'
          }
        }
      }
    ]
  });
};
