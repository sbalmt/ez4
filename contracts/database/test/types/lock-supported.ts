import type { Client, Database, Index, LockMode } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngineLock } from '../common/engines';

import { assertType } from '@ez4/utils';

declare class TestTable implements Database.Schema {
  id: string;
  value: number;
}

export declare class TestDatabase extends Database.Service<TestEngineLock<LockMode.Supported>> {
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

export async function testLockSupported({ selfClient }: Service.Context<TestDatabase>) {
  const result = await selfClient.table.findOne({
    select: {
      id: true
    },
    where: {
      id: 'abc'
    },
    lock: true
  });

  assertType<{ id: string } | undefined, typeof result>(true);
}
