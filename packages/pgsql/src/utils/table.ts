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
      const [statement, variables] = table.build();

      tableVariables.push(...variables);
      tableExpressions.push(`(${statement})`);

      continue;
    }

    tableExpressions.push(escapeSqlName(table));
  }

  return [tableExpressions, tableVariables];
};
