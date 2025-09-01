import type { SqlTableStatement } from '../../statements/table';

import { escapeSqlName } from '../../utils/escape';

export class SqlRenameTableClause {
  #state: {
    table: SqlTableStatement;
    check: boolean;
    name: string;
  };

  constructor(table: SqlTableStatement, name: string) {
    this.#state = {
      check: false,
      table,
      name
    };
  }

  get conditional() {
    return this.#state.check;
  }

  to(name: string) {
    this.#state.name = name;
  }

  existing(check = true) {
    this.#state.check = check;

    return this;
  }

  build() {
    const { table, name, check } = this.#state;

    const statement = ['ALTER', 'TABLE'];

    if (check) {
      statement.push('IF', 'EXISTS');
    }

    statement.push(escapeSqlName(table.name), 'RENAME', 'TO', escapeSqlName(name));

    return statement.join(' ');
  }
}
