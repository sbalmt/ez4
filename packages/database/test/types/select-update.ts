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

  ((_result: void) => {})(resultA);

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

  ((_result: { id: string } | undefined) => {})(resultB);
};

export const testUpdateMany = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Update without select
  const resultA = await selfClient.table.updateMany({
    data: {
      value: 123
    }
  });

  ((_result: void) => {})(resultA);

  // Update with select
  const resultB = await selfClient.table.updateMany({
    select: {
      id: true
    },
    data: {
      value: 123
    }
  });

  ((_result: { id: string }[]) => {})(resultB);
};
