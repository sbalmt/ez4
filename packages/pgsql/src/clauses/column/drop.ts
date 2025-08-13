import type { SqlAlterTableClause } from '../table/alter.js';

import { escapeSqlName } from '../../utils/escape.js';

export class SqlDropColumnClause {
  #state: {
    table: SqlAlterTableClause;
    check: boolean;
    name: string;
    cascade?: boolean;
  };

  constructor(table: SqlAlterTableClause, name: string) {
    this.#state = {
      check: false,
      table,
      name
    };
  }

  get conditional() {
    return this.#state.check;
  }

  get name() {
    return this.#state.name;
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
    const { table, name, cascade, check } = this.#state;

    if (!table.building) {
      return table.build();
    }

    const statement = ['DROP COLUMN'];

    if (check) {
      statement.push('IF EXISTS');
    }

    statement.push(escapeSqlName(name));

    if (cascade) {
      statement.push('CASCADE');
    }

    return statement.join(' ');
  }
}
