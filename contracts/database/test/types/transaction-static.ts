import type { Client, Database, Index, TransactionMode } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngineTransaction } from '../common/engines';

declare class TestTable implements Database.Schema {
  id: string;
  value: number;
}

export declare class TestDatabase extends Database.Service {
  engine: TestEngineTransaction<TransactionMode.Static>;

  client: Client<TestDatabase>;

  tables: [
    Database.UseTable<{
      name: 'table';
      schema: TestTable;
      indexes: {
        id: Index.Primary;
        value: Index.Unique;
      };
    }>
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export const testInsert = ({ selfClient }: Service.Context<TestDatabase>) => {
  return selfClient.transaction({
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

export const testUpdate = ({ selfClient }: Service.Context<TestDatabase>) => {
  return selfClient.transaction({
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

export const testDelete = ({ selfClient }: Service.Context<TestDatabase>) => {
  return selfClient.transaction({
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
