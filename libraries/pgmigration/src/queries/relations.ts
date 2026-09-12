import type { PgRelationMetadata, PgRelationRepository } from '@ez4/pgclient/library';
import type { ObjectSchema, ObjectSchemaProperties } from '@ez4/schema';
import type { ObjectComparison } from '@ez4/utils';
import type { SqlBuilder } from '@ez4/pgsql';
import type { PgMigrationQueries } from '../types/query';

import { getTableName } from '@ez4/pgclient/utils';
import { isNullishSchema } from '@ez4/schema';
import { Index } from '@ez4/database';

import { getCheckConstraintExistsQuery, getCheckConstraintInvalidQuery } from '../utils/checks';
import { getRelationName } from '../utils/naming';

type RelationQueries = Pick<PgMigrationQueries, 'relations' | 'validations'>;

export namespace RelationQuery {
  export const prepareCreate = (builder: SqlBuilder, table: string, schema: ObjectSchema, relations: PgRelationRepository) => {
    const statements: RelationQueries = {
      validations: [],
      relations: []
    };

    for (const targetAlias in relations) {
      const relation = relations[targetAlias];

      if (isNotRealRelation(relation)) {
        continue;
      }

      const { [relation.targetColumn]: targetSchema } = schema.properties;

      const relationName = getRelationName(table, targetAlias);

      const targetRequired = !!isNullishSchema(targetSchema);

      statements.relations.push({
        check: getCheckConstraintExistsQuery(builder, relationName),
        query: getCreateQuery(builder, table, relationName, relation, targetRequired).build()
      });

      statements.validations.push({
        query: getCheckConstraintInvalidQuery(builder, relationName),
        name: relationName
      });
    }

    return statements;
  };

  export const prepareUpdate = (builder: SqlBuilder, table: string, columns: ObjectSchemaProperties, relations: PgRelationRepository) => {
    const steps = {
      update: { validations: [], relations: [] } as RelationQueries,
      delete: { validations: [], relations: [] } as RelationQueries
    };

    for (const targetAlias in relations) {
      const relation = relations[targetAlias];

      if (isNotRealRelation(relation)) {
        continue;
      }

      const targetSchema = columns[relation.targetColumn];
      const targetRequired = !!(targetSchema?.optional ?? targetSchema?.nullable);

      if (targetRequired === undefined) {
        continue;
      }

      const tmpName = getRelationName(table, `${targetAlias}_tmp`);
      const newName = getRelationName(table, targetAlias);

      steps.update.relations.push({
        check: getCheckConstraintExistsQuery(builder, tmpName),
        query: getCreateQuery(builder, table, tmpName, relation, targetRequired).build()
      });

      steps.update.validations.push({
        query: getCheckConstraintInvalidQuery(builder, tmpName),
        name: newName
      });

      steps.delete.relations.push(
        {
          query: getDeleteQuery(builder, table, newName).build()
        },
        {
          query: builder.table(table).alter().existing().constraint(tmpName).rename(newName).build()
        }
      );
    }

    return steps;
  };

  export const prepareUpdateSource = (
    builder: SqlBuilder,
    table: string,
    columns: ObjectSchemaProperties,
    sourceRelations: PgRelationRepository,
    targetRelations: PgRelationRepository,
    changes: Record<string, ObjectComparison>
  ) => {
    const steps = {
      update: { validations: [], relations: [] } as RelationQueries,
      delete: { validations: [], relations: [] } as RelationQueries
    };

    for (const targetAlias in changes) {
      const newName = getRelationName(table, targetAlias);

      const sourceRelation = sourceRelations[targetAlias];
      const targetRelation = targetRelations[targetAlias];

      if (isNotRealRelation(targetRelation)) {
        if (!isNotRealRelation(sourceRelation)) {
          steps.delete.relations.push({
            query: getDeleteQuery(builder, table, newName).build()
          });
        }

        continue;
      }

      const targetSchema = columns[targetRelation.targetColumn];
      const targetRequired = !!(targetSchema?.optional ?? targetSchema?.nullable);

      const tmpName = getRelationName(table, `${targetAlias}_tmp`);

      steps.update.relations.push({
        check: getCheckConstraintExistsQuery(builder, tmpName),
        query: getCreateQuery(builder, table, tmpName, targetRelation, targetRequired).build()
      });

      steps.update.validations.push({
        query: getCheckConstraintInvalidQuery(builder, tmpName),
        name: newName
      });

      steps.delete.relations.push(
        {
          query: getDeleteQuery(builder, table, newName).build()
        },
        {
          query: builder.table(table).alter().existing().constraint(tmpName).rename(newName).build()
        }
      );
    }

    return steps;
  };

  export const prepareRename = (builder: SqlBuilder, fromTable: string, toTable: string, relations: PgRelationRepository) => {
    const statements = [];

    for (const targetAlias in relations) {
      const relation = relations[targetAlias];

      if (isNotRealRelation(relation)) {
        continue;
      }

      const oldName = getRelationName(fromTable, targetAlias);
      const newName = getRelationName(toTable, targetAlias);

      const query = builder.table(toTable).alter().existing().constraint(oldName).rename(newName);

      statements.push({
        check: getCheckConstraintExistsQuery(builder, newName),
        query: query.build()
      });
    }

    return statements;
  };

  export const prepareDelete = (builder: SqlBuilder, table: string, relations: PgRelationRepository) => {
    const statements = [];

    for (const targetAlias in relations) {
      const relation = relations[targetAlias];

      if (isNotRealRelation(relation)) {
        continue;
      }

      const relationName = getRelationName(table, targetAlias);

      statements.push({
        query: getDeleteQuery(builder, table, relationName).build()
      });
    }

    return statements;
  };

  const isNotRealRelation = (relation: PgRelationMetadata) => {
    const { sourceIndex, targetIndex } = relation;

    return !sourceIndex || sourceIndex === Index.Secondary || targetIndex === Index.Primary;
  };

  const getDeleteQuery = (builder: SqlBuilder, table: string, name: string) => {
    return builder.table(table).alter().existing().constraint(name).drop().existing();
  };

  const getCreateQuery = (builder: SqlBuilder, table: string, name: string, relation: PgRelationMetadata, optional: boolean) => {
    const { sourceTable, sourceColumn, targetColumn } = relation;

    const sourceTableName = getTableName(sourceTable);

    const query = builder.table(table).alter().existing().constraint(name);
    const constraint = query.foreign(targetColumn, sourceTableName, [sourceColumn]);

    if (!optional) {
      constraint.delete().cascade();
    } else {
      constraint.delete().null();
    }

    constraint.update().cascade();

    return query;
  };
}
