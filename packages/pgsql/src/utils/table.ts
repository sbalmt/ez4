import { SqlTableReference } from '../types/reference.js';
import { SqlSource } from '../types/source.js';
import { escapeSqlName } from './escape.js';

export const getTableExpressions = (tables: (string | SqlTableReference | SqlSource)[]) => {
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
