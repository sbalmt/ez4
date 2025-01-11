import type { Client, Database, Index, StreamChange } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';

declare class TestTableA implements Database.Schema {
  id: string;
  value_a: number;
}

declare class TestTableB implements Database.Schema {
  id: string;
  value_b: number;
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
      value_a: true,
      all_relations_b: {
        value_b: true
      }
    },
    where: {
      all_relations_b: {
        value_b: 2
      }
    }
  });

  resultA.records[0].all_relations_b[0].value_b;

  // Fetch tableB and its tableA connection
  const resultB = await client.tableB.findMany({
    select: {
      value_b: true,
      relation_a: {
        value_a: true
      }
    },
    where: {
      relation_a: {
        value_a: 1
      }
    }
  });

  resultB.records[0].relation_a.value_a;
};

const testInsert = (client: TestDatabase['client']) => {
  // Create tableA, all tableB and connect
  client.tableA.insertOne({
    data: {
      id: 'foo',
      value_a: 1,
      all_relations_b: [
        {
          id: 'bar',
          value_b: 2
        },
        {
          id: 'baz',
          value_b: 3
        }
      ]
    }
  });

  // Create tableA, tableB and connect
  client.tableB.insertOne({
    data: {
      id: 'bar',
      value_b: 2,
      relation_a: {
        id: 'foo',
        value_a: 1
      }
    }
  });

  // Create tableB and connect existing tableA
  client.tableB.insertOne({
    data: {
      id: 'bar',
      value_b: 2,
      relation_a: {
        table_a_id: 'foo'
      }
    }
  });
};

const testUpdate = (client: TestDatabase['client']) => {
  // Update tableA and all tableB connections
  client.tableA.updateMany({
    data: {
      value_a: 1,
      all_relations_b: {
        value_b: 2
      }
    },
    where: {
      all_relations_b: {
        value_b: 2
      }
    }
  });

  // Update tableB and the connected tableA
  client.tableB.updateMany({
    data: {
      value_b: 2,
      relation_a: {
        value_a: 1
      }
    },
    where: {
      relation_a: {
        value_a: 1
      }
    }
  });

  // Update tableB and connect existing tableA
  client.tableB.updateMany({
    data: {
      value_b: 2,
      relation_a: {
        table_a_id: 'foo'
      }
    }
  });
};

const testUpsert = (client: TestDatabase['client']) => {
  // Ensure insert and update follow relation rules.
  client.tableA.upsertOne({
    insert: {
      id: 'foo',
      value_a: 1,
      all_relations_b: [
        {
          id: 'bar',
          value_b: 2
        },
        {
          id: 'baz',
          value_b: 3
        }
      ]
    },
    update: {
      value_a: 1,
      all_relations_b: {
        value_b: 2
      }
    },
    where: {
      id: 'baz',
      all_relations_b: {
        value_b: 3
      }
    }
  });
};
