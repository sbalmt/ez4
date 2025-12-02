import type { Client, Database, Index } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngine } from '../common/engines';

import { assertType } from '@ez4/utils';

export declare class TestDatabase extends Database.Service {
  engine: TestEngine;

  client: Client<TestDatabase>;

  tables: [
    Database.UseTable<{
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
    }>
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

  assertType<{ foo: string | undefined; bar: number; qux: { quxBar: string } | undefined } | undefined, typeof resultA>(true);
};
