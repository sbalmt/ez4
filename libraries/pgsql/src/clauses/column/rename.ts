import type { SqlAlterTableClause } from '../table/alter';

import { escapeSqlName } from '../../utils/escape';

export class SqlRenameColumnClause {
  #state: {
    table: SqlAlterTableClause;
    name: string;
    to: string;
  };

  constructor(table: SqlAlterTableClause, name: string, to: string) {
    this.#state = {
      table,
      name,
      to
    };
  }

  to(name: string) {
    this.#state.name = name;
  }

  build() {
    const { table, name, to } = this.#state;

    if (!table.building) {
      return table.build();
    }

    const clause = ['RENAME COLUMN', escapeSqlName(name), 'TO', escapeSqlName(to)];

    return clause.join(' ');
  }
}
