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

    if (type !== Index.Primary) {
      statements.push(`CREATE INDEX "${getIndexName(name)}" ON "${table}" (${indexColumns})`);
      continue;
    }

    statements.push(
      `ALTER TABLE "${table}" ADD CONSTRAINT "${getPrimaryKey(table, name)}" PRIMARY KEY (${indexColumns})`
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

    if (type === Index.Primary) {
      statements.push(`ALTER TABLE "${table}" DROP CONSTRAINT "${getPrimaryKey(table, name)}"`);
      continue;
    }

    statements.push(`DROP INDEX "${getIndexName(name)}"`);
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
