import type { PgTableRepository } from '@ez4/pgclient/library';
import type { PgMigrationQueries, PgMigrationStepQueries } from '../types/query';

import { SqlBuilder } from '@ez4/pgsql';

import { getTableRepositoryChanges } from '../utils/repository';
import { ConstraintQuery } from '../queries/constraints';
import { RelationQuery } from '../queries/relations';
import { IndexQueries } from '../queries/indexes';
import { ColumnQuery } from '../queries/columns';
import { TableQuery } from '../queries/tables';

export const getCreateQueries = (target: PgTableRepository) => {
  const builder = new SqlBuilder();

  const queries: PgMigrationQueries = {
    tables: [],
    constraints: [],
    validations: [],
    relations: [],
    indexes: []
  };

  for (const table in target) {
    const { name, schema, indexes, relations } = target[table];

    queries.tables.push(TableQuery.prepareCreate(builder, name, schema, indexes));
    queries.relations.push(...RelationQuery.prepareCreate(builder, name, schema, relations));

    combineQueries(queries, ConstraintQuery.prepareCreate(builder, name, schema.properties));
    combineQueries(queries, IndexQueries.prepareCreate(builder, name, schema, indexes));
  }

  return queries;
};

export const getUpdateStepQueries = (target: PgTableRepository, source: PgTableRepository) => {
  const changes = getTableRepositoryChanges(target, source);
  const builder = new SqlBuilder();

  const steps: PgMigrationStepQueries = {
    create: getStepQueries(),
    update: getStepQueries(),
    delete: getStepQueries()
  };

  if (changes.create) {
    combineQueries(steps.create, getCreateQueries(changes.create));
  }

  if (changes.rename) {
    for (const fromTable in changes.rename) {
      const toTable = changes.rename[fromTable];

      const targetIndexes = target[toTable].indexes;
      const targetRelations = target[toTable].relations;
      const targetSchema = target[toTable].schema;

      steps.update.tables.push(TableQuery.prepareRename(builder, fromTable, toTable));
      steps.update.constraints.push(...ConstraintQuery.prepareRenameTable(builder, fromTable, toTable, targetSchema.properties));
      steps.update.relations.push(...RelationQuery.prepareRename(builder, fromTable, toTable, targetRelations));

      combineQueries(steps.update, IndexQueries.prepareRenameTable(builder, fromTable, toTable, targetIndexes));
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
      const targetRelations = target[table].relations;

      const sourceIndexes = source[table].indexes;
      const targetIndexes = target[table].indexes;

      const sourceSchema = source[table].schema;
      const targetSchema = target[table].schema;

      if (targetColumns?.create) {
        steps.create.tables.push(ColumnQuery.prepareCreate(builder, table, targetIndexes, targetColumns.create));
        combineQueries(steps.create, ConstraintQuery.prepareCreate(builder, table, targetColumns.create));
      }

      if (targetColumns?.nested) {
        steps.update.tables.push(...ColumnQuery.prepareUpdate(builder, table, targetSchema, targetIndexes, targetColumns.nested));
        combineQueries(steps.update, ConstraintQuery.prepareUpdate(builder, table, targetSchema, sourceSchema, targetColumns.nested));
        steps.update.relations.push(...RelationQuery.prepareUpdate(builder, table, targetRelations, targetColumns.nested));
      }

      if (targetColumns?.rename) {
        steps.update.tables.push(...ColumnQuery.prepareRename(builder, table, targetColumns.rename));
        steps.update.constraints.push(
          ...ConstraintQuery.prepareRenameColumns(builder, table, targetSchema.properties, targetColumns.rename)
        );
      }

      if (targetColumns?.remove) {
        steps.delete.tables.push(ColumnQuery.prepareDelete(builder, table, targetColumns.remove));
        steps.delete.constraints.push(...ConstraintQuery.prepareDelete(builder, table, targetColumns.remove));
      }

      if (indexChanges?.create) {
        combineQueries(steps.create, IndexQueries.prepareCreate(builder, table, targetSchema, indexChanges.create));
      }

      if (indexChanges?.nested) {
        combineQueries(
          steps.update,
          IndexQueries.prepareUpdate(builder, table, targetSchema, sourceIndexes, targetIndexes, indexChanges.nested)
        );
      }

      if (indexChanges?.rename) {
        combineQueries(steps.update, IndexQueries.prepareRenameColumns(builder, table, targetIndexes, indexChanges.rename));
      }

      if (indexChanges?.remove) {
        combineQueries(steps.delete, IndexQueries.prepareDelete(builder, table, indexChanges.remove));
      }

      if (relationChanges?.create) {
        steps.create.relations.push(...RelationQuery.prepareCreate(builder, table, targetSchema, relationChanges.create));
      }

      if (relationChanges?.remove) {
        steps.delete.relations.push(...RelationQuery.prepareDelete(builder, table, relationChanges.remove));
      }
    }
  }

  if (changes.remove) {
    combineQueries(steps.delete, getDeleteQueries(changes.remove));
  }

  return steps;
};

export const getDeleteQueries = (target: PgTableRepository) => {
  const builder = new SqlBuilder();

  const queries: PgMigrationQueries = {
    tables: [],
    constraints: [],
    validations: [],
    relations: [],
    indexes: []
  };

  for (const table in target) {
    const { name } = target[table];

    queries.tables.push(TableQuery.prepareDelete(builder, name));
  }

  return queries;
};

const combineQueries = (target: PgMigrationQueries, source: Partial<PgMigrationQueries>) => {
  if (source.tables) {
    target.tables.push(...source.tables);
  }

  if (source.constraints) {
    target.constraints.push(...source.constraints);
  }

  if (source.validations) {
    target.validations.push(...source.validations);
  }

  if (source.relations) {
    target.relations.push(...source.relations);
  }

  if (source.indexes) {
    target.indexes.push(...source.indexes);
  }
};

const getStepQueries = () => {
  return {
    tables: [],
    constraints: [],
    validations: [],
    relations: [],
    indexes: []
  };
};
