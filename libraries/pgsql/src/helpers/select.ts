import type { SqlBuilderReferences } from '../builder';

import { escapeSqlName } from '../utils/escape';
import { SqlTableReference } from '../common/reference';
import { SqlSource } from '../common/source';
import { getUniqueAlias } from './alias';

export const getSelectExpressions = (tables: (string | SqlTableReference | SqlSource)[], references: SqlBuilderReferences) => {
  const tableExpressions = [];
  const tableVariables = [];

  for (const table of tables) {
    if (table instanceof SqlTableReference) {
      tableExpressions.push(table.build());
      continue;
    }

    if (table instanceof SqlSource) {
      const temporaryAlias = getUniqueAlias('S', references);
      const originalAlias = table.alias;

      const [statement, variables] = table.as(temporaryAlias).build();

      tableVariables.push(...variables);

      if (originalAlias) {
        tableExpressions.push(`(${statement}) AS ${escapeSqlName(originalAlias)}`);
      } else {
        tableExpressions.push(`(${statement})`);
      }

      continue;
    }

    tableExpressions.push(escapeSqlName(table));
  }

  return [tableExpressions, tableVariables];
};
