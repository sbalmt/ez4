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

  assertType<void, typeof resultA>(true);

  // Delete with select
  const resultB = await selfClient.table.deleteOne({
    select: {
      id: true
    },
    where: {
      id: 'foo'
    }
  });

  assertType<{ id: string } | undefined, typeof resultB>(true);
}

export async function testDeleteMany({ selfClient }: Service.Context<TestDatabase>) {
  // Delete without select
  const resultA = await selfClient.table.deleteMany({
    where: {
      id: 'foo'
    }
  });

  assertType<void, typeof resultA>(true);

  // Delete with select
  const resultB = await selfClient.table.deleteMany({
    select: {
      id: true
    },
    where: {
      id: 'foo'
    }
  });

  assertType<{ id: string }[], typeof resultB>(true);
}
