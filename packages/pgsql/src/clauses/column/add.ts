import type { SqlAlterTableClause } from '../table/alter.js';

import { escapeSqlName } from '../../utils/escape.js';

export class SqlAddColumnClause {
  #state: {
    table: SqlAlterTableClause;
    check: boolean;
    name: string;
    type: string;
    required?: boolean;
    value?: string;
  };

  constructor(table: SqlAlterTableClause, name: string, type: string) {
    this.#state = {
      check: false,
      table,
      name,
      type
    };
  }

  get conditional() {
    return this.#state.check;
  }

  get name() {
    return this.#state.name;
  }

  get type() {
    return this.#state.type;
  }

  missing(check = true) {
    this.#state.check = check;

    return this;
  }

  required(apply = true) {
    this.#state.required = apply;

    return this;
  }

  default(value: string) {
    this.#state.value = value;

    return this;
  }

  build() {
    const { table, name, type, value, required, check } = this.#state;

    if (!table.building) {
      return table.build();
    }

    const clause = ['ADD COLUMN'];

    if (check) {
      clause.push('IF NOT EXISTS');
    }

    clause.push(escapeSqlName(name), type);

    if (value) {
      clause.push('DEFAULT', value);
    }

    if (required) {
      clause.push('NOT null');
    }

    return clause.join(' ');
  }
}
