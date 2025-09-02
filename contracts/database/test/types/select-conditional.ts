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
        foo: string;
        bar: number;
        baz: string;
        qux: {
          quxFoo: number;
          quxBar: string;
        };
      };
    }
  ];

  services: {
    selfClient: Environment.Service<TestDatabase>;
  };
}

export const testSelectConditional = async ({ selfClient }: Service.Context<TestDatabase>, flag?: boolean) => {
  // Select required array
  const resultA = await selfClient.table_a.findOne({
    select: {
      foo: flag,
      bar: true,
      baz: false,
      qux: flag && {
        quxBar: true
      }
    },
    where: {
      id: 'abc'
    }
  });

  ((_result: { foo: string | undefined; bar: number }) => {})(resultA!);
};
