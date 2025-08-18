import type { PgTableRepository } from '@ez4/pgclient/library';
import type { PgMigrationQueries } from '../types/query.js';

import { SqlBuilder } from '@ez4/pgsql';

import { prepareCreateTable, prepareDeleteTable, prepareRenameTable } from '../common/tables.js';
import { prepareCreateRelations, prepareDeleteRelations, prepareRenameRelations } from '../common/relations.js';
import { prepareCreateColumns, prepareDeleteColumns, prepareRenameColumns, prepareUpdateColumns } from '../common/columns.js';
import { prepareCreateIndexes, prepareDeleteIndexes, prepareRenameIndexes } from '../common/indexes.js';
import { getTableRepositoryChanges } from '../utils/repository.js';

export const getCreateQueries = (target: PgTableRepository) => {
  const builder = new SqlBuilder();

  const queries: PgMigrationQueries = {
    tables: [],
    relations: [],
    indexes: []
  };

  for (const table in target) {
    const { name, schema, indexes, relations } = target[table];

    queries.indexes.push(...prepareCreateIndexes(builder, name, schema, indexes, false));
    queries.relations.push(...prepareCreateRelations(builder, name, relations));
    queries.tables.push(prepareCreateTable(builder, name, schema, indexes));
  }

  return queries;
};

export const getUpdateQueries = (target: PgTableRepository, source: PgTableRepository) => {
  const changes = getTableRepositoryChanges(target, source);

  const builder = new SqlBuilder();

  const queries: PgMigrationQueries = {
    tables: [],
    relations: [],
    indexes: []
  };

  if (changes.create) {
    combineMigrationQueries(queries, getCreateQueries(changes.create));
  }

  if (changes.rename) {
    for (const fromTable in changes.rename) {
      const toTable = changes.rename[fromTable];

      const targetIndexes = target[toTable].indexes;
      const targetRelations = target[toTable].relations;

      queries.indexes.push(...prepareRenameIndexes(builder, fromTable, toTable, targetIndexes));
      queries.relations.push(...prepareRenameRelations(builder, fromTable, toTable, targetRelations));
      queries.tables.push(prepareRenameTable(builder, fromTable, toTable));
    }
  }

  if (changes.nested) {
    for (const table in changes.nested) {
      const { nested: tableChanges } = changes.nested[table];

      if (!tableChanges) {
        continue;
      }

      const { schema, relations: relationChanges, indexes: indexChanges } = tableChanges;

      const targetColumns = schema?.nested?.properties;
      const targetIndexes = target[table].indexes;
      const targetSchema = target[table].schema;

      if (targetColumns?.create) {
        queries.tables.push(prepareCreateColumns(builder, table, targetIndexes, targetColumns.create));
      }

      if (targetColumns?.nested) {
        queries.tables.push(...prepareUpdateColumns(builder, table, targetSchema, targetIndexes, targetColumns?.nested));
      }

      if (targetColumns?.rename) {
        queries.tables.push(...prepareRenameColumns(builder, table, targetColumns?.rename));
      }

      if (targetColumns?.remove) {
        queries.tables.push(prepareDeleteColumns(builder, table, targetColumns.remove));
      }

      if (indexChanges?.create) {
        queries.indexes.push(...prepareCreateIndexes(builder, table, targetSchema, indexChanges.create, true));
      }

      if (indexChanges?.remove) {
        queries.indexes.push(...prepareDeleteIndexes(builder, table, indexChanges.remove));
      }

      if (relationChanges?.create) {
        queries.relations.push(...prepareCreateRelations(builder, table, relationChanges.create));
      }

      if (relationChanges?.remove) {
        queries.relations.push(...prepareDeleteRelations(builder, table, relationChanges.remove));
      }
    }
  }

  if (changes.remove) {
    combineMigrationQueries(queries, getDeleteQueries(changes.remove));
  }

  return queries;
};

export const getDeleteQueries = (target: PgTableRepository) => {
  const builder = new SqlBuilder();

  const queries: PgMigrationQueries = {
    tables: [],
    relations: [],
    indexes: []
  };

  for (const table in target) {
    const { name } = target[table];

    queries.tables.push(prepareDeleteTable(builder, name));
  }

  return queries;
};

const combineMigrationQueries = (target: PgMigrationQueries, source: PgMigrationQueries) => {
  target.indexes.push(...source.indexes);
  target.relations.push(...source.relations);
  target.tables.push(...source.tables);
};
