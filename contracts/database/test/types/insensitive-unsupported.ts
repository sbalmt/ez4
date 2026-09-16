import type { Client, Database, Index, InsensitiveMode } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngineInsensitive } from '../common/engines';

import { assertType } from '@ez4/utils';

declare class TestTable implements Database.Schema {
  id: string;
  text: string;
}

export declare class TestDatabase extends Database.Service<TestEngineInsensitive<InsensitiveMode.Unsupported>> {
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

export async function testInsensitiveUnsupported({ selfClient }: Service.Context<TestDatabase>) {
  const result = await selfClient.table.findMany({
    select: {
      id: true
    },
    where: {
      text: 'foo'
    }
  });

  assertType<{ id: string }[], typeof result.records>(true);
}
