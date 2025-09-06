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

export const testUpdateOne = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Update without select
  const resultA = await selfClient.table.updateOne({
    data: {
      value: 123
    },
    where: {
      id: 'foo'
    }
  });

  assertType<void, typeof resultA>(true);

  // Update with select
  const resultB = await selfClient.table.updateOne({
    select: {
      id: true
    },
    data: {
      value: 123
    },
    where: {
      id: 'foo'
    }
  });

  assertType<{ id: string } | undefined, typeof resultB>(true);
};

export const testUpdateMany = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Update without select
  const resultA = await selfClient.table.updateMany({
    data: {
      value: 123
    }
  });

  assertType<void, typeof resultA>(true);

  // Update with select
  const resultB = await selfClient.table.updateMany({
    select: {
      id: true
    },
    data: {
      value: 123
    }
  });

  assertType<{ id: string }[], typeof resultB>(true);
};
