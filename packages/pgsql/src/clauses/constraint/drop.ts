import type { SqlAlterTableClause } from '../table/alter.js';

import { escapeSqlName } from '../../utils/escape.js';

export class SqlDropConstraintClause {
  #state: {
    table: SqlAlterTableClause;
    check: boolean;
    name: string;
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

  build() {
    const { table, name, check } = this.#state;

    if (!table.building) {
      return table.build();
    }

    const statement = ['DROP CONSTRAINT'];

    if (check) {
      statement.push('IF EXISTS');
    }

    statement.push(escapeSqlName(name));

    return statement.join(' ');
  }
}
