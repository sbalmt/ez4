import type { PgTableRepository } from '@ez4/pgclient/library';
import type { OptionalObject } from '@ez4/utils';
import type { PgMigrationQueries, PgMigrationSteps } from '../types/query';

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

    combineQueries(queries, RelationQuery.prepareCreate(builder, name, schema, relations));
    combineQueries(queries, ConstraintQuery.prepareCreate(builder, name, schema.properties));
    combineQueries(queries, IndexQueries.prepareCreate(builder, name, schema, indexes));
  }

  return queries;
};

export const getUpdateStepQueries = (target: PgTableRepository, source: PgTableRepository) => {
  const changes = getTableRepositoryChanges(target, source);
  const builder = new SqlBuilder();

  const steps: PgMigrationSteps = {
    prepare: getStepQueries(),
    rollout: getStepQueries(),
    cleanup: getStepQueries()
  };

  if (changes.create) {
    combineQueries(steps.prepare, getCreateQueries(changes.create));
  }

  if (changes.rename) {
    for (const fromTable in changes.rename) {
      const toTable = changes.rename[fromTable];

      const targetIndexes = target[toTable].indexes;
      const targetRelations = target[toTable].relations;
      const targetSchema = target[toTable].schema;

      steps.rollout.tables.push(TableQuery.prepareRename(builder, fromTable, toTable));
      steps.rollout.constraints.push(...ConstraintQuery.prepareRenameTable(builder, fromTable, toTable, targetSchema.properties));
      steps.rollout.relations.push(...RelationQuery.prepareRename(builder, fromTable, toTable, targetRelations));

      combineQueries(steps.rollout, IndexQueries.prepareRenameTable(builder, fromTable, toTable, targetIndexes));
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

      const sourceRelations = changes.source[table].relations;
      const targetRelations = target[table].relations;

      const sourceIndexes = changes.source[table].indexes;
      const targetIndexes = target[table].indexes;

      const sourceSchema = changes.source[table].schema;
      const targetSchema = target[table].schema;

      if (targetColumns?.create) {
        steps.prepare.tables.push(ColumnQuery.prepareCreate(builder, table, targetIndexes, targetColumns.create));
        combineQueries(steps.prepare, ConstraintQuery.prepareCreate(builder, table, targetColumns.create));
      }

      if (targetColumns?.nested) {
        steps.rollout.tables.push(...ColumnQuery.prepareUpdate(builder, table, targetSchema, targetIndexes, targetColumns.nested));
        combineSteps(steps, ConstraintQuery.prepareUpdate(builder, table, targetSchema, sourceSchema, targetColumns.nested));
        combineSteps(steps, RelationQuery.prepareUpdate(builder, table, targetSchema.properties, targetRelations));
      }

      if (targetColumns?.rename) {
        steps.rollout.tables.push(...ColumnQuery.prepareRename(builder, table, targetColumns.rename));
        steps.rollout.constraints.push(
          ...ConstraintQuery.prepareRenameColumns(builder, table, targetSchema.properties, targetColumns.rename)
        );
      }

      if (targetColumns?.remove) {
        steps.cleanup.tables.push(ColumnQuery.prepareDelete(builder, table, targetColumns.remove));
        steps.cleanup.constraints.push(...ConstraintQuery.prepareDelete(builder, table, targetColumns.remove));
      }

      if (indexChanges?.create) {
        combineQueries(steps.rollout, IndexQueries.prepareCreate(builder, table, targetSchema, indexChanges.create));
      }

      if (indexChanges?.nested) {
        combineQueries(
          steps.rollout,
          IndexQueries.prepareUpdate(builder, table, targetSchema, sourceIndexes, targetIndexes, indexChanges.nested)
        );
      }

      if (indexChanges?.rename) {
        combineQueries(steps.rollout, IndexQueries.prepareRenameColumns(builder, table, targetIndexes, indexChanges.rename));
      }

      if (indexChanges?.remove) {
        combineQueries(steps.cleanup, IndexQueries.prepareDelete(builder, table, indexChanges.remove));
      }

      if (relationChanges?.create) {
        combineQueries(steps.rollout, RelationQuery.prepareCreate(builder, table, targetSchema, relationChanges.create));
      }

      if (relationChanges?.nested) {
        combineSteps(
          steps,
          RelationQuery.prepareUpdateSource(
            builder,
            table,
            targetSchema.properties,
            sourceRelations,
            targetRelations,
            relationChanges.nested
          )
        );
      }

      if (relationChanges?.remove) {
        steps.cleanup.relations.push(...RelationQuery.prepareDelete(builder, table, relationChanges.remove));
      }
    }
  }

  if (changes.remove) {
    combineQueries(steps.cleanup, getDeleteQueries(changes.remove));
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

const combineSteps = (target: PgMigrationSteps, source: OptionalObject<PgMigrationSteps>) => {
  if (source.prepare) {
    combineQueries(target.prepare, source.prepare);
  }

  if (source.rollout) {
    combineQueries(target.rollout, source.rollout);
  }

  if (source.cleanup) {
    combineQueries(target.cleanup, source.cleanup);
  }
};

const combineQueries = (target: PgMigrationQueries, source: OptionalObject<PgMigrationQueries>) => {
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
