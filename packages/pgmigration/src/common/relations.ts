import type { PgRelationRepository } from '@ez4/pgclient/library';
import type { ObjectSchema } from '@ez4/schema';
import type { SqlBuilder } from '@ez4/pgsql';

import { getTableName } from '@ez4/pgclient/library';
import { IsNullishSchema } from '@ez4/schema';
import { Index } from '@ez4/database';

import { getCheckConstraintQuery } from '../utils/checks.js';
import { getRelationName } from '../utils/naming.js';

export const prepareCreateRelations = (builder: SqlBuilder, table: string, schema: ObjectSchema, relations: PgRelationRepository) => {
  const statements = [];

  for (const targetAlias in relations) {
    const relation = relations[targetAlias];

    if (relation.targetIndex === Index.Primary) {
      continue;
    }

    const { sourceAlias, sourceColumn, targetColumn } = relation;
    const { [targetColumn]: targetSchema } = schema.properties;

    const relationName = getRelationName(table, targetAlias);
    const sourceTable = getTableName(sourceAlias);

    const query = builder.table(table).alter().existing().constraint(relationName).foreign(targetColumn, sourceTable, [sourceColumn]);

    if (!IsNullishSchema(targetSchema)) {
      query.delete().cascade();
    } else {
      query.delete().null();
    }

    query.update().cascade();

    statements.push({
      check: getCheckConstraintQuery(builder, relationName),
      query: query.build()
    });
  }

  return statements;
};

export const prepareRenameRelations = (builder: SqlBuilder, fromTable: string, toTable: string, relations: PgRelationRepository) => {
  const statements = [];

  for (const targetAlias in relations) {
    const relation = relations[targetAlias];

    if (relation.targetIndex === Index.Primary) {
      continue;
    }

    const oldName = getRelationName(fromTable, targetAlias);
    const newName = getRelationName(toTable, targetAlias);

    const statement = builder.table(toTable).alter().existing().constraint(oldName).rename(newName);

    statements.push({
      check: getCheckConstraintQuery(builder, newName),
      query: statement.build()
    });
  }

  return statements;
};

export const prepareDeleteRelations = (builder: SqlBuilder, table: string, relations: PgRelationRepository) => {
  const statements = [];

  for (const targetAlias in relations) {
    const relation = relations[targetAlias];

    if (relation.targetIndex === Index.Primary) {
      continue;
    }

    const name = getRelationName(table, targetAlias);

    const query = builder.table(table).alter().existing().constraint(name).drop().existing();

    statements.push({
      query: query.build()
    });
  }

  return statements;
};
