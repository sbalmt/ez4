import type { PgTableRepository } from '@ez4/pgclient/library';
import type { PgMigrationQueries } from '../types/query.js';

import { SqlBuilder } from '@ez4/pgsql';

import { TablesQuery } from '../queries/tables.js';
import { ColumnsQuery } from '../queries/columns.js';
import { ConstraintsQuery } from '../queries/constraints.js';
import { RelationsQuery } from '../queries/relations.js';
import { IndexesQueries } from '../queries/indexes.js';
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

    queries.tables.push(TablesQuery.prepareCreate(builder, name, schema, indexes));
    queries.constraints.push(...ConstraintsQuery.prepareCreate(builder, name, schema.properties));
    queries.relations.push(...RelationsQuery.prepareCreate(builder, name, schema, relations));

    combineMigrationQueries(queries, IndexesQueries.prepareCreate(builder, name, schema, indexes, false));
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

      queries.tables.push(TablesQuery.prepareRename(builder, fromTable, toTable));
      queries.constraints.push(...ConstraintsQuery.prepareRenameTable(builder, fromTable, toTable, targetSchema.properties));
      queries.relations.push(...RelationsQuery.prepareRename(builder, fromTable, toTable, targetRelations));

      combineMigrationQueries(queries, IndexesQueries.prepareRename(builder, fromTable, toTable, targetIndexes));
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
        queries.tables.push(ColumnsQuery.prepareCreate(builder, table, targetIndexes, targetColumns.create));
        queries.constraints.push(...ConstraintsQuery.prepareCreate(builder, table, targetColumns.create));
      }

      if (targetColumns?.nested) {
        queries.tables.push(...ColumnsQuery.prepareUpdate(builder, table, targetSchema, targetIndexes, targetColumns.nested));
        queries.constraints.push(...ConstraintsQuery.prepareUpdate(builder, table, targetSchema, sourceSchema, targetColumns.nested));
        queries.relations.push(...RelationsQuery.prepareUpdate(builder, table, targetRelations, targetColumns.nested));
      }

      if (targetColumns?.rename) {
        queries.tables.push(...ColumnsQuery.prepareRename(builder, table, targetColumns.rename));
        queries.constraints.push(...ConstraintsQuery.prepareRenameColumns(builder, table, targetSchema.properties, targetColumns.rename));
      }

      if (targetColumns?.remove) {
        queries.tables.push(ColumnsQuery.prepareDelete(builder, table, targetColumns.remove));
        queries.constraints.push(...ConstraintsQuery.prepareDelete(builder, table, targetColumns.remove));
      }

      if (indexChanges?.create) {
        combineMigrationQueries(queries, IndexesQueries.prepareCreate(builder, table, targetSchema, indexChanges.create, true));
      }

      if (indexChanges?.remove) {
        combineMigrationQueries(queries, IndexesQueries.prepareDelete(builder, table, indexChanges.remove));
      }

      if (relationChanges?.create) {
        queries.relations.push(...RelationsQuery.prepareCreate(builder, table, targetSchema, relationChanges.create));
      }

      if (relationChanges?.remove) {
        queries.relations.push(...RelationsQuery.prepareDelete(builder, table, relationChanges.remove));
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

    queries.tables.push(TablesQuery.prepareDelete(builder, name));
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
