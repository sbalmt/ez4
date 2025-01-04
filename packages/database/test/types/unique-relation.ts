import type { Client, Database, Index, StreamChange } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';

declare class TestTableA implements Database.Schema {
  id: string;
  value: number;
}

declare class TestTableB implements Database.Schema {
  id: string;
  value: number;
  table_a_id: string;
}

export declare class TestDatabase extends Database.Service<[TestTableA, TestTableB]> {
  engine: 'test';

  client: Client<TestDatabase>;

  tables: [
    {
      name: 'tableA';
      schema: TestTableA;
      relations: {
        'tableB:table_a_id': 'id@relation_b';
      };
      indexes: {
        id: Index.Primary;
      };
      stream: {
        handler: typeof testHandler;
      };
    },
    {
      name: 'tableB';
      schema: TestTableB;
      relations: {
        'tableA:id': 'table_a_id@relation_a';
      };
      indexes: {
        id: Index.Primary;
        table_a_id: Index.Unique;
      };
    }
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export async function testHandler(
  _change: StreamChange<TestTableA>,
  { selfClient }: Service.Context<TestDatabase>
) {
  testSelect(selfClient);
  testInsert(selfClient);
  testUpdate(selfClient);
}

const testSelect = (client: TestDatabase['client']) => {
  // Fetch tableA and all tableB connections
  client.tableA.findMany({
    select: {
      value: true,
      relation_b: {
        value: true
      }
    }
  });

  // Fetch tableB and its tableA connection
  client.tableB.findMany({
    select: {
      value: true,
      relation_a: {
        value: true
      }
    }
  });
};

const testInsert = (client: TestDatabase['client']) => {
  // Create tableB, tableA and connect
  client.tableA.insertOne({
    data: {
      id: 'foo',
      value: 1,
      relation_b: {
        id: 'bar',
        value: 2
      }
    }
  });

  // Create tableA, tableB and connect
  client.tableB.insertOne({
    data: {
      id: 'foo',
      value: 1,
      relation_a: {
        id: 'bar',
        value: 2
      }
    }
  });

  // Create tableB and connect existing tableA
  client.tableB.insertOne({
    data: {
      id: 'foo',
      value: 1,
      relation_a: {
        table_a_id: 'bar'
      }
    }
  });
};

const testUpdate = (client: TestDatabase['client']) => {
  // Update tableA and the connected tableB
  client.tableA.updateMany({
    data: {
      value: 1,
      relation_b: {
        value: 2
      }
    }
  });

  // Update tableB and the connected tableA
  client.tableB.updateMany({
    data: {
      value: 1,
      relation_a: {
        value: 2
      }
    }
  });

  // Update tableB and connect existing tableA
  client.tableB.updateMany({
    data: {
      value: 1,
      relation_a: {
        table_a_id: 'bar'
      }
    }
  });
};
