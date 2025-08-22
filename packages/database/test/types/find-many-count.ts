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

export async function testFindMany({ selfClient }: Service.Context<TestDatabase>) {
  // Find without count
  const { records: outputA } = await selfClient.table.findMany({
    select: {
      id: true
    }
  });

  ((_records: { id: string }[]) => {})(outputA);

  // Find with count
  const { records: outputB, total: totalB } = await selfClient.table.findMany({
    count: true,
    select: {
      id: true
    }
  });

  ((_records: { id: string }[], _total: number) => {})(outputB, totalB);
}
