import type { Client, Database, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines.js';

import { Order } from '@ez4/database';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  client: Client<TestDatabase>;

  tables: [
    {
      name: 'tableA';
      relations: {
        'id@relation_b': 'tableB:table_a_id';
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
        table_a_id: Index.Unique;
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
        table_b_id: Index.Unique;
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
      relation_b: {
        value_b: true
      }
    },
    include: {
      relation_b: {
        where: {
          value_b: 2
        },
        order: {
          value_b: Order.Asc
        },
        skip: 0,
        take: 1
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

  resultB.records[0].relation_a.value_a;

  // Fetch tableC and its optional tableB connection
  const resultC = await selfClient.tableC.findMany({
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

  // Fetch tableB connections through tableC.
  const resultD = await selfClient.tableC.findMany({
    select: {
      relation_b: {
        relation_a: {
          value_a: true
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
  resultD.records[0].relation_b?.relation_c?.value_c;
};

export const testInsert = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Create tableB, tableA and connect
  await selfClient.tableA.insertOne({
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
  await selfClient.tableB.insertOne({
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
  await selfClient.tableB.insertOne({
    data: {
      id: 'foo',
      value_b: 1,
      relation_a: {
        table_a_id: 'bar'
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

export const testUpdate = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Update tableA and the connected tableB
  await selfClient.tableA.updateMany({
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
  await selfClient.tableB.updateMany({
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
  await selfClient.tableB.updateMany({
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

  // Update tableB from tableC.
  await selfClient.tableC.updateMany({
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

export const testUpsert = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Ensure insert and update follow relation rules.
  await selfClient.tableA.upsertOne({
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
