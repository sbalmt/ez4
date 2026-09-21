import type { Client, Database, Index, UndefinedMode } from '@ez4/database';
import type { Environment, Service } from '@ez4/common';
import type { TestEngineUndefined } from '../common/engines';

import { assertType } from '@ez4/utils';

declare class SupportedDatabase extends Database.Service<TestEngineUndefined<UndefinedMode.Supported>> {
  client: Client<SupportedDatabase>;

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
    selfClient: Environment.Service<SupportedDatabase>;
  };
}

export const testHandler = async ({ selfClient }: Service.Context<SupportedDatabase>) => {
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

  assertType<
    { optional?: string; undefined: number | undefined; required: boolean; json?: { nested?: string } } | undefined,
    typeof result
  >(true);
};
