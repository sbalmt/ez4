import type { RepositoryIndexes } from '../../types/repository.js';

import { toCamelCase } from '@ez4/utils';
import { Index } from '@ez4/database';

export const prepareCreateIndexes = (table: string, indexes: RepositoryIndexes) => {
  const statements = [];

  for (const indexName in indexes) {
    if (!indexes[indexName]) {
      continue;
    }

    const { columns, type } = indexes[indexName];

    const indexColumns = columns.map((column) => `"${column}"`).join(', ');

    if (type !== Index.Primary) {
      statements.push(`CREATE INDEX "${getIndexName(indexName)}" ON "${table}" (${indexColumns})`);
      continue;
    }

    statements.push(
      `ALTER TABLE "${table}" ` +
        `ADD CONSTRAINT "${getPrimaryKey(table, indexName)}" ` +
        `PRIMARY KEY (${indexColumns})`
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

  for (const indexName in indexes) {
    if (!indexes[indexName]) {
      continue;
    }

    const { type } = indexes[indexName];

    if (type !== Index.Primary) {
      statements.push(`DROP INDEX "${getIndexName(indexName)}"`);
      continue;
    }

    const relationName = getPrimaryKey(table, indexName);

    statements.push(`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${relationName}"`);
  }

  return statements;
};

const getName = (name: string) => {
  return toCamelCase(name.replaceAll(':', '_'));
};

const getPrimaryKey = (table: string, name: string) => {
  return `${table}_${getName(name)}_pk`;
};

const getIndexName = (name: string) => {
  return `${getName(name)}_idx`;
};
