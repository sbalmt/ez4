import type { Client, Database, Index, ParametersMode, TransactionMode, PaginationMode, OrderMode } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';

declare class TestTable implements Database.Schema {
  id: string;
  value: number;
  unique_idx_p1: number;
  unique_idx_p2: string;
  unique_idx: number;
}

export declare class TestDatabase extends Database.Service {
  engine: {
    parametersMode: ParametersMode.OnlyIndex;
    transactionMode: TransactionMode.Static;
    paginationMode: PaginationMode.Offset;
    orderMode: OrderMode.AnyColumns;
    name: 'test';
  };

  client: Client<TestDatabase>;

  tables: [
    {
      name: 'table';
      schema: TestTable;
      indexes: {
        id: Index.Primary;
        'unique_idx_p1:unique_idx_p2': Index.Unique;
        unique_idx: Index.Unique;
      };
    }
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export async function testHandler({ selfClient }: Service.Context<TestDatabase>) {
  testSelect(selfClient);
  testUpdate(selfClient);
  testUpsert(selfClient);
  testDelete(selfClient);
}

const testSelect = (client: TestDatabase['client']) => {
  return client.table.findOne({
    select: {},
    where: {
      unique_idx: 123
    }
  });
};

const testUpdate = (client: TestDatabase['client']) => {
  return client.table.updateOne({
    data: {
      value: 123
    },
    where: {
      unique_idx_p1: 456,
      unique_idx_p2: 'foo'
    }
  });
};

const testUpsert = (client: TestDatabase['client']) => {
  return client.table.upsertOne({
    insert: {
      id: 'foo',
      value: 123,
      unique_idx_p1: 456,
      unique_idx_p2: 'bar',
      unique_idx: 789
    },
    update: {
      value: 456
    },
    where: {
      unique_idx: 789
    }
  });
};

const testDelete = (client: TestDatabase['client']) => {
  return client.table.deleteOne({
    where: {
      unique_idx_p1: 123,
      unique_idx_p2: 'foo'
    }
  });
};
