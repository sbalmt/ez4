import type { Client, Database, Index, RelationMode, StreamMode } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines';

import { assertType } from '@ez4/utils';

export type UnsupportedRelationEngine = {
  parametersMode: TestEngine['parametersMode'];
  transactionMode: TestEngine['transactionMode'];
  insensitiveMode: TestEngine['insensitiveMode'];
  paginationMode: TestEngine['paginationMode'];
  relationMode: RelationMode.Unsupported;
  streamMode: StreamMode.Unsupported;
  orderMode: TestEngine['orderMode'];
  lockMode: TestEngine['lockMode'];
  options: never;
  name: 'unsupported';
};

declare class TestTable implements Database.Schema {
  id: string;
  text: string;
}

export declare class TestDatabase extends Database.Service<UnsupportedRelationEngine> {
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

export async function testUnsupportedModes({ selfClient }: Service.Context<TestDatabase>) {
  const result = await selfClient.table.findMany({
    select: {
      id: true
    },
    where: {
      id: 'abc'
    }
  });

  assertType<{ id: string }[], typeof result.records>(true);
}
