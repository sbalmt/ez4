import type { PgTableRepository } from '@ez4/pgclient/library';

import { SchemaType } from '@ez4/schema';

export const getRepositoryStub = (repository: PgTableRepository) => {
  const stub: PgTableRepository = {};

  for (const tableKey in repository) {
    const { name } = repository[tableKey];

    stub[tableKey] = {
      name,
      relations: {},
      indexes: {},
      schema: {
        type: SchemaType.Object,
        properties: {}
      }
    };
  }

  return stub;
};
