import type { Client, Database, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines.js';

import { Order } from '@ez4/database';

declare class TestTableA implements Database.Schema {
  id: string;
  value_a: number;
}

declare class TestTableB implements Database.Schema {
  id: string;
  table_a_id: string;
  value_b: number;
}

declare class TestTableC implements Database.Schema {
  id: string;
  table_b_id?: string;
  value_c: number;
}

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  client: Client<TestDatabase>;

  tables: [
    {
      name: 'tableA';
      schema: TestTableA;
      relations: {
        'id@all_relations_b': 'tableB:table_a_id';
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
        table_a_id: Index.Secondary;
      };
    },
    {
      name: 'tableC';
      schema: TestTableC;
      relations: {
        'table_b_id@relation_b': 'tableB:id';
      };
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
    include: {
      all_relations_b: {
        where: {
          value_b: 2
        },
        order: {
          value_b: Order.Desc
        },
        skip: 0,
        take: 1
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

  // Fetch tableC and its optional tableB connection
  const resultC = await client.tableC.findMany({
    select: {
      value_c: true,
      relation_b: true
    },
    where: {
      relation_b: {
        value_b: 1
      }
    }
  });

  resultC.records[0].relation_b?.value_b;
};

const testInsert = async (client: TestDatabase['client']) => {
  // Create tableA, all tableB and connect
  await client.tableA.insertOne({
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
  await client.tableB.insertOne({
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
  await client.tableB.insertOne({
    data: {
      id: 'bar',
      value_b: 2,
      relation_a: {
        table_a_id: 'foo'
      }
    }
  });

  // Create tableC, optionally tableB and connect
  await client.tableC.insertOne({
    data: {
      id: 'foo',
      value_c: 1,
      relation_b: {
        id: 'bar',
        table_a_id: 'baz',
        value_b: 2
      }
    }
  });
};

const testUpdate = async (client: TestDatabase['client']) => {
  // Update tableA and all tableB connections
  await client.tableA.updateMany({
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
    }
  });

  // Update tableB from tableC.
  await client.tableC.updateMany({
    data: {
      relation_b: {
        value_b: 2
      }
    },
    where: {
      relation_b: {
        id: 'foo'
      }
    }
  });
};

const testUpsert = (client: TestDatabase['client']) => {
  // Ensure insert and update follow relation rules.
  return client.tableA.upsertOne({
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
