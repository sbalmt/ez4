import type { PgRelationRepository } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject, ObjectComparison } from '@ez4/utils';
import type { SqlBuilder } from '@ez4/pgsql';

import { getTableName } from '@ez4/pgclient/library';
import { IsNullishSchema } from '@ez4/schema';
import { Index } from '@ez4/database';

import { getCheckConstraintQuery } from '../utils/checks.js';
import { getRelationName } from '../utils/naming.js';

export namespace RelationsQuery {
  export const prepareCreate = (builder: SqlBuilder, table: string, schema: ObjectSchema, relations: PgRelationRepository) => {
    const statements = [];

    for (const targetAlias in relations) {
      const relation = relations[targetAlias];

      if (relation.targetIndex === Index.Primary) {
        continue;
      }

      const { [relation.targetColumn]: targetSchema } = schema.properties;

      const relationName = getRelationName(table, targetAlias);

      const targetRequired = !!IsNullishSchema(targetSchema);

      statements.push({
        check: getCheckConstraintQuery(builder, relationName),
        query: getCreateQuery(builder, table, relationName, relation, targetRequired).build()
      });
    }

    return statements;
  };

  export const prepareUpdate = (
    builder: SqlBuilder,
    table: string,
    relations: PgRelationRepository,
    changes: Record<string, ObjectComparison>
  ) => {
    const statements: any[] = [];

    for (const targetAlias in relations) {
      const relation = relations[targetAlias];

      if (relation.targetIndex === Index.Primary) {
        continue;
      }

      const targetUpdates = changes[relation.targetColumn]?.update;
      const targetRequired = targetUpdates?.optional ?? targetUpdates?.nullable;

      if (targetRequired === undefined) {
        continue;
      }

      const relationName = getRelationName(table, targetAlias);

      statements.push(
        {
          query: getDeleteQuery(builder, table, relationName).build()
        },
        {
          query: getCreateQuery(builder, table, relationName, relation, targetRequired).build()
        }
      );
    }

    return statements;
  };

  export const prepareRename = (builder: SqlBuilder, fromTable: string, toTable: string, relations: PgRelationRepository) => {
    const statements = [];

    for (const targetAlias in relations) {
      const relation = relations[targetAlias];

      if (relation.targetIndex === Index.Primary) {
        continue;
      }

      const oldName = getRelationName(fromTable, targetAlias);
      const newName = getRelationName(toTable, targetAlias);

      const query = builder.table(toTable).alter().existing().constraint(oldName).rename(newName);

      statements.push({
        check: getCheckConstraintQuery(builder, newName),
        query: query.build()
      });
    }

    return statements;
  };

  export const prepareDelete = (builder: SqlBuilder, table: string, relations: PgRelationRepository) => {
    const statements = [];

    for (const targetAlias in relations) {
      const relation = relations[targetAlias];

      if (relation.targetIndex === Index.Primary) {
        continue;
      }

      const relationName = getRelationName(table, targetAlias);

      statements.push({
        query: getDeleteQuery(builder, table, relationName).build()
      });
    }

    return statements;
  };

  const getDeleteQuery = (builder: SqlBuilder, table: string, name: string) => {
    return builder.table(table).alter().existing().constraint(name).drop().existing();
  };

  const getCreateQuery = (builder: SqlBuilder, table: string, name: string, relation: AnyObject, optional: boolean) => {
    const { sourceAlias, sourceColumn, targetColumn } = relation;

    const sourceTable = getTableName(sourceAlias);

    const query = builder.table(table).alter().existing().constraint(name).foreign(targetColumn, sourceTable, [sourceColumn]);

    if (!optional) {
      query.delete().cascade();
    } else {
      query.delete().null();
    }

    query.update().cascade();

    return query;
  };
}
