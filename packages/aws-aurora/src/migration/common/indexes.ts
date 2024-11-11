import type { RepositoryIndexes } from '../../types/repository.js';

import { toCamelCase } from '@ez4/utils';
import { Index } from '@ez4/database';

export const prepareCreateIndexes = (table: string, indexes: RepositoryIndexes) => {
  const statements = [];

  for (const name in indexes) {
    if (!indexes[name]) {
      continue;
    }

    const { columns, type } = indexes[name];

    const indexColumns = columns.map((column) => `"${column}"`).join(', ');
    const indexName = toCamelCase(name);

    if (type !== Index.Primary) {
      statements.push(`CREATE INDEX "${indexName}_idx" ON "${table}" (${indexColumns})`);
      continue;
    }

    statements.push(
      `ALTER TABLE "${table}" ADD CONSTRAINT "${indexName}_pk" PRIMARY KEY (${indexColumns})`
    );
  }

  return statements;
};

export const prepareUpdateIndexes = (
  table: string,
  toCreate: RepositoryIndexes,
  toRemove: RepositoryIndexes
) => {
  return [...prepareDeleteIndexes(table, toRemove), ...prepareCreateIndexes(table, toCreate)];
};

export const prepareDeleteIndexes = (table: string, indexes: RepositoryIndexes) => {
  const statements = [];

  for (const name in indexes) {
    if (!indexes[name]) {
      continue;
    }

    const { type } = indexes[name];

    const indexName = toCamelCase(name);

    if (type === Index.Primary) {
      statements.push(`ALTER TABLE "${table}" DROP CONSTRAINT "${indexName}_pk"`);
      continue;
    }

    statements.push(`DROP INDEX "${indexName}_idx"`);
  }

  return statements;
};
