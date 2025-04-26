import type { Client, Database, Index, ParametersType, TransactionType } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';

declare class TestTable implements Database.Schema {
  id: string;
  value: number;
}

export declare class TestDatabase extends Database.Service {
  engine: {
    parameters: ParametersType.OnlyIndex;
    transaction: TransactionType.Static;
    name: 'test';
  };

  client: Client<TestDatabase>;

  tables: [
    {
      name: 'table';
      schema: TestTable;
      indexes: {
        id: Index.Primary;
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
      id: 'foo'
    }
  });
};

const testUpdate = (client: TestDatabase['client']) => {
  return client.table.updateOne({
    data: {
      value: 123
    },
    where: {
      id: 'foo'
    }
  });
};

const testUpsert = (client: TestDatabase['client']) => {
  return client.table.upsertOne({
    insert: {
      id: 'foo',
      value: 123
    },
    update: {
      value: 456
    },
    where: {
      id: 'foo'
    }
  });
};

const testDelete = (client: TestDatabase['client']) => {
  return client.table.deleteOne({
    where: {
      id: 'foo'
    }
  });
};
