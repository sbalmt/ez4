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

export const testInsertOne = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Insert without select
  const resultA = await selfClient.table.insertOne({
    data: {
      id: 'foo',
      value: 123
    }
  });

  assertType<void, typeof resultA>(true);

  // Insert with select
  const resultB = await selfClient.table.insertOne({
    select: {
      id: true
    },
    data: {
      id: 'foo',
      value: 123
    }
  });

  assertType<{ id: string }, typeof resultB>(true);
};

export const testInsertMany = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Insert without select
  const resultA = await selfClient.table.insertMany({
    data: [
      {
        id: 'foo',
        value: 123
      }
    ]
  });

  assertType<void, typeof resultA>(true);
};
