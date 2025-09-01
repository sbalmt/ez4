import type { Client, Database, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  client: Client<TestDatabase>;

  tables: [
    {
      name: 'table_a';
      indexes: {
        id: Index.Primary;
      };
      schema: {
        id: string;
        value: {
          foo: number;
        }[];
      };
    },
    {
      name: 'table_b';
      indexes: {
        id: Index.Primary;
      };
      schema: {
        id: string;
        value?: {
          foo: string;
        }[];
      };
    }
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export const testSelectArray = async ({ selfClient }: Service.Context<TestDatabase>) => {
  // Select required array
  const resultA = await selfClient.table_a.findOne({
    select: {
      value: true
    },
    where: {
      id: 'abc'
    }
  });

  ((_result: { foo: number }[]) => {})(resultA!.value);

  // Select optional array
  const resultB = await selfClient.table_b.findOne({
    select: {
      value: true
    },
    where: {
      id: 'abc'
    }
  });

  ((_result: { foo: string }[] | undefined) => {})(resultB!.value);
};
