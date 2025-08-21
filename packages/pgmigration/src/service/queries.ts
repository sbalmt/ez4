import type { PgTableRepository } from '@ez4/pgclient/library';
import type { PgMigrationQueries } from '../types/query.js';

import { SqlBuilder } from '@ez4/pgsql';

import { prepareCreateTable, prepareDeleteTable, prepareRenameTable } from '../common/tables.js';
import { prepareCreateColumns, prepareDeleteColumns, prepareRenameColumns, prepareUpdateColumns } from '../common/columns.js';
import {
  prepareCreateConstraints,
  prepareDeleteConstraints,
  prepareRenameConstraintColumns,
  prepareRenameConstraints,
  prepareUpdateConstraints
} from '../common/constraints.js';
import { prepareCreateRelations, prepareDeleteRelations, prepareRenameRelations, prepareUpdateRelations } from '../common/relations.js';
import { prepareCreateIndexes, prepareDeleteIndexes, prepareRenameIndexes } from '../common/indexes.js';
import { getTableRepositoryChanges } from '../utils/repository.js';

export const getCreateQueries = (target: PgTableRepository) => {
  const builder = new SqlBuilder();

  const queries: PgMigrationQueries = {
    tables: [],
    constraints: [],
    relations: [],
    indexes: []
  };

  for (const table in target) {
    const { name, schema, indexes, relations } = target[table];

    combineMigrationQueries(queries, prepareCreateIndexes(builder, name, schema, indexes, false));

    queries.tables.push(prepareCreateTable(builder, name, schema, indexes));
    queries.constraints.push(...prepareCreateConstraints(builder, name, schema.properties));
    queries.relations.push(...prepareCreateRelations(builder, name, schema, relations));
  }

  return queries;
};

export const getUpdateQueries = (target: PgTableRepository, source: PgTableRepository) => {
  const changes = getTableRepositoryChanges(target, source);

  const builder = new SqlBuilder();

  const queries: PgMigrationQueries = {
    tables: [],
    constraints: [],
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
      const targetSchema = target[toTable].schema;

      combineMigrationQueries(queries, prepareRenameIndexes(builder, fromTable, toTable, targetIndexes));

      queries.constraints.push(...prepareRenameConstraints(builder, fromTable, toTable, targetSchema.properties));
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
      const targetRelations = target[table].relations;

      const sourceSchema = source[table].schema;
      const targetSchema = target[table].schema;

      if (targetColumns?.create) {
        queries.tables.push(prepareCreateColumns(builder, table, targetIndexes, targetColumns.create));
        queries.constraints.push(...prepareCreateConstraints(builder, table, targetColumns.create));
      }

      if (targetColumns?.nested) {
        queries.tables.push(...prepareUpdateColumns(builder, table, targetSchema, targetIndexes, targetColumns.nested));
        queries.constraints.push(...prepareUpdateConstraints(builder, table, targetSchema, sourceSchema, targetColumns.nested));
        queries.relations.push(...prepareUpdateRelations(builder, table, targetRelations, targetColumns.nested));
      }

      if (targetColumns?.rename) {
        queries.tables.push(...prepareRenameColumns(builder, table, targetColumns.rename));
        queries.constraints.push(...prepareRenameConstraintColumns(builder, table, targetSchema.properties, targetColumns.rename));
      }

      if (targetColumns?.remove) {
        queries.tables.push(prepareDeleteColumns(builder, table, targetColumns.remove));
        queries.constraints.push(...prepareDeleteConstraints(builder, table, targetColumns.remove));
      }

      if (indexChanges?.create) {
        combineMigrationQueries(queries, prepareCreateIndexes(builder, table, targetSchema, indexChanges.create, true));
      }

      if (indexChanges?.remove) {
        combineMigrationQueries(queries, prepareDeleteIndexes(builder, table, indexChanges.remove));
      }

      if (relationChanges?.create) {
        queries.relations.push(...prepareCreateRelations(builder, table, targetSchema, relationChanges.create));
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
    constraints: [],
    relations: [],
    indexes: []
  };

  for (const table in target) {
    const { name } = target[table];

    queries.tables.push(prepareDeleteTable(builder, name));
  }

  return queries;
};

const combineMigrationQueries = (target: PgMigrationQueries, source: Partial<PgMigrationQueries>) => {
  if (source.indexes) {
    target.indexes.push(...source.indexes);
  }

  if (source.constraints) {
    target.constraints.push(...source.constraints);
  }

  if (source.relations) {
    target.relations.push(...source.relations);
  }

  if (source.tables) {
    target.tables.push(...source.tables);
  }
};
