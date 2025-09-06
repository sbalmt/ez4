import type { Client, Database, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines';

import { assertType } from '@ez4/utils';
import { Order } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  client: Client<TestDatabase>;

  tables: [
    {
      name: 'tableA';
      relations: {
        'id@all_relations_b': 'tableB:table_a_id';
      };
      indexes: {
        id: Index.Primary;
      };
      schema: {
        id: string;
        value_a: number;
      };
    },
    {
      name: 'tableB';
      relations: {
        'table_a_id@relation_a': 'tableA:id';
        'table_c_id@relation_c': 'tableC:id';
      };
      indexes: {
        id: Index.Primary;
        table_a_id: Index.Secondary;
      };
      schema: {
        id: string;
        table_a_id: string;
        table_c_id?: string;
        value_b: number;
      };
    },
    {
      name: 'tableC';
      relations: {
        'table_b_id@relation_b': 'tableB:id';
      };
      indexes: {
        id: Index.Primary;
      };
      schema: {
        id: string;
        table_b_id?: string;
        value_c: number;
      };
    }
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export const testSelect = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Fetch tableA and all tableB connections
  const resultA = await selfClient.tableA.findMany({
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
        value_b: 1
      }
    }
  });

  assertType<{ records: { value_a: number; all_relations_b: { value_b: number }[] }[] }, typeof resultA>(true);

  // Fetch tableB and its tableA connection
  const resultB = await selfClient.tableB.findMany({
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

  assertType<{ records: { value_b: number; relation_a: { value_a: number } }[] }, typeof resultB>(true);

  // Fetch tableC and its optional tableB connection
  const resultC = await selfClient.tableC.findMany({
    select: {
      value_c: true,
      relation_b: {
        value_b: true
      }
    },
    where: {
      relation_b: {
        value_b: 1
      }
    }
  });

  assertType<{ records: { value_c: number; relation_b: { value_b: number } | undefined }[] }, typeof resultC>(true);

  // Fetch tableB and tableA connections through tableC.
  const resultD = await selfClient.tableC.findMany({
    select: {
      relation_b: {
        relation_a: {
          value_a: true,
          all_relations_b: {
            relation_c: {
              value_c: true
            }
          }
        },
        relation_c: {
          value_c: true
        }
      }
    },
    where: {
      value_c: 1
    }
  });

  resultD.records[0].relation_b?.relation_a.value_a;
  resultD.records[0].relation_b?.relation_a.all_relations_b[0].relation_c?.value_c;
  resultD.records[0].relation_b?.relation_c?.value_c;
};

export const testInsert = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Create tableA, all tableB and connect
  await selfClient.tableA.insertOne({
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
  await selfClient.tableB.insertOne({
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
  await selfClient.tableB.insertOne({
    data: {
      id: 'bar',
      value_b: 2,
      relation_a: {
        table_a_id: 'foo'
      }
    }
  });

  // Create tableC, optionally tableB and connect
  await selfClient.tableC.insertOne({
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

export const testUpdate = async (client: TestDatabase['client']) => {
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
        value_b: 1
      }
    }
  });
};

export const testUpsert = (client: TestDatabase['client']) => {
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
