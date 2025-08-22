import type { Client, Database, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines.js';

declare class TestTableA implements Database.Schema {
  id: string;
  value_a1: number;
  value_a2: number;
  value_a3: number;
  value_a4: number;
}

declare class TestTableB implements Database.Schema {
  id: string;
  table_a_id: string;
  value_b1: number;
  value_b2: number;
  value_b3: number;
  value_b4: number;
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
    }
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export const testUpdate = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Update tableA and all tableB connections
  await selfClient.tableA.updateOne({
    data: {
      value_a1: { increment: 10 },
      value_a2: { decrement: 15 },
      value_a3: { multiply: 20 },
      value_a4: { divide: 25 },
      all_relations_b: {
        value_b1: { increment: 30 },
        value_b2: { decrement: 35 },
        value_b3: { multiply: 40 },
        value_b4: { divide: 45 }
      }
    },
    where: {
      id: 'foo'
    }
  });

  // Update tableB and the connected tableA
  await selfClient.tableB.updateOne({
    data: {
      value_b1: { increment: 30 },
      value_b2: { decrement: 35 },
      value_b3: { multiply: 40 },
      value_b4: { divide: 45 },
      relation_a: {
        value_a1: { increment: 10 },
        value_a2: { decrement: 15 },
        value_a3: { multiply: 20 },
        value_a4: { divide: 25 }
      }
    },
    where: {
      id: 'bar'
    }
  });
};

export const testUpsert = ({ selfClient }: Service.Context<TestDatabase>) => {
  // Ensure insert and update follow relation rules.
  return selfClient.tableA.upsertOne({
    insert: {
      id: 'foo',
      value_a1: 0,
      value_a2: 0,
      value_a3: 0,
      value_a4: 0,
      all_relations_b: [
        {
          id: 'bar',
          value_b1: 0,
          value_b2: 0,
          value_b3: 0,
          value_b4: 0
        }
      ]
    },
    update: {
      value_a1: { increment: 10 },
      value_a2: { decrement: 15 },
      value_a3: { multiply: 20 },
      value_a4: { divide: 25 },
      all_relations_b: {
        value_b1: { increment: 30 },
        value_b2: { decrement: 35 },
        value_b3: { multiply: 40 },
        value_b4: { divide: 45 }
      }
    },
    where: {
      id: 'baz'
    }
  });
};
