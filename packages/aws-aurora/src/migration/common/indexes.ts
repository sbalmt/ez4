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

    switch (type) {
      case Index.Primary:
        statements.push(
          `ALTER TABLE "${table}" ` +
            `ADD CONSTRAINT "${getPrimaryKey(table, indexName)}" ` +
            `PRIMARY KEY (${indexColumns})`
        );
        break;

      case Index.Secondary:
        statements.push(
          `CREATE INDEX "${getSecondaryKey(table, indexName)}" ON "${table}" (${indexColumns})`
        );
        break;

      case Index.Unique:
        statements.push(
          `ALTER TABLE "${table}" ` +
            `ADD CONSTRAINT "${getUniqueKey(table, indexName)}" ` +
            `UNIQUE (${indexColumns})`
        );
    }
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

    switch (type) {
      case Index.Primary:
        statements.push(
          `ALTER TABLE "${table}" DROP CONSTRAINT ` +
            `IF EXISTS "${getPrimaryKey(table, indexName)}"`
        );
        break;

      case Index.Secondary:
        statements.push(`DROP INDEX IF EXISTS "${getSecondaryKey(table, indexName)}"`);
        break;

      case Index.Unique:
        statements.push(
          `ALTER TABLE "${table}" DROP CONSTRAINT ` +
            `IF EXISTS "${getUniqueKey(table, indexName)}"`
        );
        break;
    }
  }

  return statements;
};

const getName = (name: string) => {
  return toCamelCase(name.replaceAll(':', '_'));
};

const getPrimaryKey = (table: string, name: string) => {
  return `${table}_${getName(name)}_pk`;
};

const getUniqueKey = (table: string, name: string) => {
  return `${table}_${getName(name)}_unq`;
};

const getSecondaryKey = (table: string, name: string) => {
  return `${table}_${getName(name)}_idx`;
};
