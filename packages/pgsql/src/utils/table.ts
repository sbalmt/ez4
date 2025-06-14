import { SqlSource } from '../types/source.js';
import { MissingTableAliasError } from '../errors/queries.js';
import { escapeSqlName } from './escape.js';

export const getTableNames = (tables: (SqlSource | string)[]) => {
  const tableNames = [];

  for (const table of tables) {
    if (table instanceof SqlSource) {
      if (!table.alias) {
        throw new MissingTableAliasError();
      }

      tableNames.push(escapeSqlName(table.alias));
      continue;
    }

    tableNames.push(escapeSqlName(table));
  }

  return tableNames;
};
