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
        'tableB:table_a_id': 'id@all_relations_b';
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
        table_a_id: Index.Secondary;
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
  testUpsert(selfClient);
}

const testSelect = async (client: TestDatabase['client']) => {
  // Fetch tableA and all tableB connections
  const resultA = await client.tableA.findMany({
    select: {
      value: true,
      all_relations_b: {
        value: true
      }
    }
  });

  resultA.records[0].all_relations_b[0].value;

  // Fetch tableB and its tableA connection
  const resultB = await client.tableB.findMany({
    select: {
      value: true,
      relation_a: {
        value: true
      }
    }
  });

  resultB.records[0].relation_a.value;
};

const testInsert = (client: TestDatabase['client']) => {
  // Create tableA, all tableB and connect
  client.tableA.insertOne({
    data: {
      id: 'foo',
      value: 1,
      all_relations_b: [
        {
          id: 'bar',
          value: 2
        },
        {
          id: 'baz',
          value: 3
        }
      ]
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
  // Update tableA and all tableB connections
  client.tableA.updateMany({
    data: {
      value: 1,
      all_relations_b: {
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

const testUpsert = (client: TestDatabase['client']) => {
  // Ensure insert and update follow relation rules.
  client.tableA.upsertOne({
    insert: {
      id: 'foo',
      value: 1,
      all_relations_b: [
        {
          id: 'bar',
          value: 2
        },
        {
          id: 'baz',
          value: 3
        }
      ]
    },
    update: {
      value: 1,
      all_relations_b: {
        value: 2
      }
    },
    where: {
      id: 'baz'
    }
  });
};
