import type { SqlAlterTableClause } from '../table/alter.js';

import { escapeSqlName } from '../../utils/escape.js';

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

    const statement = ['RENAME COLUMN', escapeSqlName(name), 'TO', escapeSqlName(to)];

    return statement.join(' ');
  }
}
