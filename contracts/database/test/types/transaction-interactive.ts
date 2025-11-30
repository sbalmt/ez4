import type { Client, Database, Index, TransactionMode } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngineTransaction } from '../common/engines';

import { assertType } from '@ez4/utils';

declare class TestTable implements Database.Schema {
  id: string;
  value: number;
}

export declare class TestDatabase extends Database.Service {
  engine: TestEngineTransaction<TransactionMode.Interactive>;

  client: Client<TestDatabase>;

  tables: [
    Database.UseTable<{
      name: 'table';
      schema: TestTable;
      indexes: {
        id: Index.Primary;
        value: Index.Unique;
      };
    }>
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export async function testHandler({ selfClient }: Service.Context<TestDatabase>) {
  const result = await selfClient.transaction(async (client) => {
    return client.table.count({
      where: {
        id: 'abc'
      }
    });
  });

  assertType<number, typeof result>(true);
}
