import type { Client, Database, Index, StreamChange } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';

declare class TestTable implements Database.Schema {
  id: string;
  value: number;
}

export declare class TestDatabase extends Database.Service<[TestTable]> {
  engine: 'test';

  client: Client<TestDatabase>;

  tables: [
    {
      name: 'table';
      schema: TestTable;
      indexes: {
        id: Index.Primary;
        value: Index.Unique;
      };
      stream: {
        handler: typeof testHandler;
      };
    }
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export async function testHandler(
  _change: StreamChange<TestTable>,
  { selfClient }: Service.Context<TestDatabase>
) {
  testSelect(selfClient);
  testUpdate(selfClient);
  testUpsert(selfClient);
  testDelete(selfClient);
}

const testSelect = (client: TestDatabase['client']) => {
  client.table.findOne({
    select: {},
    where: {
      value: 123
    }
  });
};

const testUpdate = (client: TestDatabase['client']) => {
  client.table.updateOne({
    data: {
      value: 456
    },
    where: {
      value: 123
    }
  });
};

const testUpsert = (client: TestDatabase['client']) => {
  client.table.upsertOne({
    insert: {
      id: 'foo',
      value: 456
    },
    update: {
      value: 456
    },
    where: {
      value: 123
    }
  });
};

const testDelete = (client: TestDatabase['client']) => {
  client.table.deleteOne({
    where: {
      value: 123
    }
  });
};
