import type { Client, Database, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines';

import { assertType } from '@ez4/utils';

declare class TestTable implements Database.Schema {
  id: string;
  value: number;
}

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  client: Client<TestDatabase>;

  tables: [
    Database.UseTable<{
      name: 'table';
      schema: TestTable;
      indexes: {
        id: Index.Primary;
      };
    }>
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

  assertType<{ id: string }[], typeof outputA>(true);

  // Find with count
  const { records: outputB, total: totalB } = await selfClient.table.findMany({
    count: true,
    select: {
      id: true
    }
  });

  assertType<{ id: string }[], typeof outputB>(true);
  assertType<number, typeof totalB>(true);
}
