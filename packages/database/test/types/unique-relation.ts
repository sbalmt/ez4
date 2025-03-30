import type { Client, Database, Index, TransactionType } from '@ez4/database';
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

export declare class TestDatabase extends Database.Service {
  engine: {
    transaction: TransactionType.Object;
    name: 'test';
  };

  client: Client<TestDatabase>;

  tables: [
    {
      name: 'tableA';
      schema: TestTableA;
      relations: {
        'id@relation_b': 'tableB:table_a_id';
      };
      indexes: {
        id: Index.Primary;
      };
    },
    {
      name: 'tableB';
      schema: TestTableB;
      relations: {
        'table_a_id@relation_a': 'tableA:id';
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

export async function testHandler({ selfClient }: Service.Context<TestDatabase>) {
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
      relation_b: {
        value_b: true
      }
    },
    include: {
      relation_b: {
        value_b: 2
      }
    },
    where: {
      relation_b: {
        value_b: 2
      }
    }
  });

  resultA.records[0].relation_b?.value_b;

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

const testInsert = async (client: TestDatabase['client']) => {
  // Create tableB, tableA and connect
  await client.tableA.insertOne({
    data: {
      id: 'foo',
      value_a: 1,
      relation_b: {
        id: 'bar',
        value_b: 2
      }
    }
  });

  // Create tableA, tableB and connect
  await client.tableB.insertOne({
    data: {
      id: 'foo',
      value_b: 1,
      relation_a: {
        id: 'bar',
        value_a: 2
      }
    }
  });

  // Create tableB and connect existing tableA
  await client.tableB.insertOne({
    data: {
      id: 'foo',
      value_b: 1,
      relation_a: {
        table_a_id: 'bar'
      }
    }
  });
};

const testUpdate = async (client: TestDatabase['client']) => {
  // Update tableA and the connected tableB
  await client.tableA.updateMany({
    data: {
      value_a: 1,
      relation_b: {
        value_b: 2
      }
    },
    where: {
      relation_b: {
        value_b: 2
      }
    }
  });

  // Update tableB and the connected tableA
  await client.tableB.updateMany({
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
  await client.tableB.updateMany({
    data: {
      value_b: 2,
      relation_a: {
        table_a_id: 'foo'
      }
    },
    where: {
      relation_a: {
        value_a: 1
      }
    }
  });
};

const testUpsert = async (client: TestDatabase['client']) => {
  // Ensure insert and update follow relation rules.
  await client.tableA.upsertOne({
    insert: {
      id: 'foo',
      value_a: 1,
      relation_b: {
        id: 'bar',
        value_b: 2
      }
    },
    update: {
      value_a: 1,
      relation_b: {
        value_b: 2
      }
    },
    where: {
      id: 'baz',
      relation_b: {
        value_b: 3
      }
    }
  });
};
