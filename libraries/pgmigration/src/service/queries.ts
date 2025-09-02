import type { PgTableRepository } from '@ez4/pgclient/library';
import type { PgMigrationQueries } from '../types/query';

import { SqlBuilder } from '@ez4/pgsql';

import { TableQuery } from '../queries/tables';
import { ColumnQuery } from '../queries/columns';
import { ConstraintQuery } from '../queries/constraints';
import { RelationQuery } from '../queries/relations';
import { IndexQueries } from '../queries/indexes';
import { getTableRepositoryChanges } from '../utils/repository';

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

    queries.tables.push(TableQuery.prepareCreate(builder, name, schema, indexes));
    queries.constraints.push(...ConstraintQuery.prepareCreate(builder, name, schema.properties));
    queries.relations.push(...RelationQuery.prepareCreate(builder, name, schema, relations));

    combineMigrationQueries(queries, IndexQueries.prepareCreate(builder, name, schema, indexes, false));
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

      queries.tables.push(TableQuery.prepareRename(builder, fromTable, toTable));
      queries.constraints.push(...ConstraintQuery.prepareRenameTable(builder, fromTable, toTable, targetSchema.properties));
      queries.relations.push(...RelationQuery.prepareRename(builder, fromTable, toTable, targetRelations));

      combineMigrationQueries(queries, IndexQueries.prepareRename(builder, fromTable, toTable, targetIndexes));
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
        queries.tables.push(ColumnQuery.prepareCreate(builder, table, targetIndexes, targetColumns.create));
        queries.constraints.push(...ConstraintQuery.prepareCreate(builder, table, targetColumns.create));
      }

      if (targetColumns?.nested) {
        queries.tables.push(...ColumnQuery.prepareUpdate(builder, table, targetSchema, targetIndexes, targetColumns.nested));
        queries.constraints.push(...ConstraintQuery.prepareUpdate(builder, table, targetSchema, sourceSchema, targetColumns.nested));
        queries.relations.push(...RelationQuery.prepareUpdate(builder, table, targetRelations, targetColumns.nested));
      }

      if (targetColumns?.rename) {
        queries.tables.push(...ColumnQuery.prepareRename(builder, table, targetColumns.rename));
        queries.constraints.push(...ConstraintQuery.prepareRenameColumns(builder, table, targetSchema.properties, targetColumns.rename));
      }

      if (targetColumns?.remove) {
        queries.tables.push(ColumnQuery.prepareDelete(builder, table, targetColumns.remove));
        queries.constraints.push(...ConstraintQuery.prepareDelete(builder, table, targetColumns.remove));
      }

      if (indexChanges?.create) {
        combineMigrationQueries(queries, IndexQueries.prepareCreate(builder, table, targetSchema, indexChanges.create, true));
      }

      if (indexChanges?.remove) {
        combineMigrationQueries(queries, IndexQueries.prepareDelete(builder, table, indexChanges.remove));
      }

      if (relationChanges?.create) {
        queries.relations.push(...RelationQuery.prepareCreate(builder, table, targetSchema, relationChanges.create));
      }

      if (relationChanges?.remove) {
        queries.relations.push(...RelationQuery.prepareDelete(builder, table, relationChanges.remove));
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

    queries.tables.push(TableQuery.prepareDelete(builder, name));
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
