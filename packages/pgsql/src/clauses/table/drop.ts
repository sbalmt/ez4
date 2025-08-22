import type { SqlTableStatement } from '../../statements/table.js';

import { escapeSqlName } from '../../utils/escape.js';

export class SqlDropTableClause {
  #state: {
    table: SqlTableStatement;
    cascade?: boolean;
    check: boolean;
  };

  constructor(table: SqlTableStatement) {
    this.#state = {
      check: false,
      table
    };
  }

  get conditional() {
    return this.#state.check;
  }

  existing(check = true) {
    this.#state.check = check;

    return this;
  }

  cascade(apply = true) {
    this.#state.cascade = apply;

    return this;
  }

  build() {
    const { table, cascade, check } = this.#state;

    const statement = ['DROP', 'TABLE'];

    if (check) {
      statement.push('IF', 'EXISTS');
    }

    statement.push(escapeSqlName(table.name));

    if (cascade) {
      statement.push('CASCADE');
    }

    return statement.join(' ');
  }
}
