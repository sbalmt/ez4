import type { PgRelationRepository } from '@ez4/pgclient/library';
import type { SqlBuilder } from '@ez4/pgsql';

import { getTableName } from '@ez4/pgclient/library';
import { Index } from '@ez4/database';

import { getRelationName } from '../utils/names.js';

export const prepareCreateRelations = (builder: SqlBuilder, table: string, relations: PgRelationRepository) => {
  const statements = [];

  for (const alias in relations) {
    const relation = relations[alias];

    if (!relation || relation.targetIndex === Index.Primary) {
      continue;
    }

    const { sourceAlias, sourceColumn, targetColumn } = relation;

    const relationName = getRelationName(table, alias);
    const sourceTable = getTableName(sourceAlias);

    const statement = builder.table(table).alter().constraint(relationName).foreign(targetColumn, sourceTable, [sourceColumn]);

    statement.delete().cascade();
    statement.update().cascade();

    statements.push(statement.build());
  }

  return statements;
};

export const prepareDeleteRelations = (builder: SqlBuilder, table: string, relations: PgRelationRepository) => {
  const statements = [];

  for (const alias in relations) {
    const relation = relations[alias];

    if (!relation || relation.targetIndex === Index.Primary) {
      continue;
    }

    const relationName = getRelationName(table, alias);

    const statement = builder.table(table).alter().constraint(relationName).drop().existing();

    statements.push(statement.build());
  }

  return statements;
};
