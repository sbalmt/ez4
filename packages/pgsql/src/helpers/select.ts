import { escapeSqlName } from '../utils/escape.js';
import { SqlTableReference } from '../common/reference.js';
import { SqlSource } from '../common/source.js';

export const getSelectExpressions = (tables: (string | SqlTableReference | SqlSource)[]) => {
  const tableExpressions = [];
  const tableVariables = [];

  for (const table of tables) {
    if (table instanceof SqlTableReference) {
      tableExpressions.push(table.build());
      continue;
    }

    if (table instanceof SqlSource) {
      const originalAlias = table.alias;

      const [statement, variables] = table.as('S').build();

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
