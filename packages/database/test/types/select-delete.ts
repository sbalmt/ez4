import type { Client, Database, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines.js';

declare class TestTable implements Database.Schema {
  id: string;
  value: number;
}

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

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

export async function testDeleteOne({ selfClient }: Service.Context<TestDatabase>) {
  // Delete without select
  const resultA = await selfClient.table.deleteOne({
    where: {
      id: 'foo'
    }
  });

  ((_result: void) => {})(resultA);

  // Delete with select
  const resultB = await selfClient.table.deleteOne({
    select: {
      id: true
    },
    where: {
      id: 'foo'
    }
  });

  ((_result: { id: string } | undefined) => {})(resultB);
}

export async function testDeleteMany({ selfClient }: Service.Context<TestDatabase>) {
  // Delete without select
  const resultA = await selfClient.table.deleteMany({
    where: {
      id: 'foo'
    }
  });

  ((_result: void) => {})(resultA);

  // Delete with select
  const resultB = await selfClient.table.deleteMany({
    select: {
      id: true
    },
    where: {
      id: 'foo'
    }
  });

  ((_result: { id: string }[]) => {})(resultB);
}
