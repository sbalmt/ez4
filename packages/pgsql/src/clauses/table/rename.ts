import type { SqlTableStatement } from '../../statements/table.js';

import { escapeSqlName } from '../../utils/escape.js';

export class SqlRenameTableClause {
  #state: {
    table: SqlTableStatement;
    name: string;
  };

  constructor(table: SqlTableStatement, name: string) {
    this.#state = {
      table,
      name
    };
  }

  to(name: string) {
    this.#state.name = name;
  }

  build() {
    const { table, name } = this.#state;

    const statement = ['ALTER TABLE', escapeSqlName(table.name), 'RENAME TO', escapeSqlName(name)];

    return statement.join(' ');
  }
}
