import type { Client, Database, Index, UndefinedMode } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngineUndefined } from '../common/engines';

import { assertType } from '@ez4/utils';

declare class UnsupportedDatabase extends Database.Service<TestEngineUndefined<UndefinedMode.Unsupported>> {
  client: Client<UnsupportedDatabase>;

  tables: [
    Database.UseTable<{
      name: 'table';
      indexes: {
        id: Index.Primary;
      };
      schema: {
        id: string;
        optional?: string;
        undefined: number | undefined;
        required: boolean;
        json?: {
          nested?: string;
        };
      };
    }>
  ];

  services: {
    selfClient: Environment.Service<UnsupportedDatabase>;
  };
}

export const testHandler = async ({ selfClient }: Service.Context<UnsupportedDatabase>) => {
  const result = await selfClient.table.findOne({
    select: {
      optional: true,
      undefined: true,
      required: true,
      json: true
    },
    where: {
      id: 'abc'
    }
  });

  if (result) {
    result;
  }

  assertType<
    { optional: string | null; undefined: number | null; required: boolean; json: { nested?: string } | null } | undefined,
    typeof result
  >(true);
};
