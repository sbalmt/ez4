import type { SqlUpdateStatement } from '../statements/update';
import type { SqlInsertStatement } from '../statements/insert';
import type { SqlBuilderReferences } from '../builder';

import { escapeSqlName } from '../utils/escape';
import { SqlUnionClause } from '../clauses/query/union';
import { SqlSelectStatement } from '../statements/select';
import { SqlTableReference } from '../common/reference';
import { SqlRawValue } from '../common/raw';
import { getUniqueAlias } from './alias';

export const getSelectExpressions = (
  source: SqlSelectStatement | SqlUpdateStatement | SqlInsertStatement,
  references: SqlBuilderReferences,
  tables: (string | SqlRawValue | SqlTableReference | SqlUnionClause | SqlSelectStatement)[]
) => {
  const tableExpressions = [];
  const tableVariables = [];

  for (const table of tables) {
    if (table instanceof SqlRawValue) {
      tableExpressions.push(table.build());
      continue;
    }

    if (table instanceof SqlTableReference) {
      tableExpressions.push(table.build());
      continue;
    }

    if (table instanceof SqlUnionClause) {
      const [statement, variables] = table.build();

      if (source instanceof SqlSelectStatement && !source.alias) {
        tableExpressions.push(`(${statement}) AS ${escapeSqlName(getUniqueAlias('U', references))}`);
      } else {
        tableExpressions.push(`(${statement})`);
      }

      tableVariables.push(...variables);
      continue;
    }

    if (table instanceof SqlSelectStatement) {
      const temporaryAlias = getUniqueAlias('S', references);
      const requiredAlias = table.alias ?? temporaryAlias;

      const [statement, variables] = table.as(temporaryAlias).build();

      if (!(source instanceof SqlSelectStatement) || !source.alias) {
        tableExpressions.push(`(${statement}) AS ${escapeSqlName(requiredAlias)}`);
      } else {
        tableExpressions.push(`(${statement})`);
      }

      tableVariables.push(...variables);
      continue;
    }

    tableExpressions.push(escapeSqlName(table));
  }

  return [tableExpressions, tableVariables];
};
