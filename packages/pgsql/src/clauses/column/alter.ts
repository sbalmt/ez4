import type { SqlAlterTableClause } from '../table/alter.js';

import { escapeSqlName } from '../../utils/escape.js';

export class SqlAlterColumnClause {
  #state: {
    table: SqlAlterTableClause;
    check: boolean;
    name: string;
    required?: boolean;
    value?: string | null;
    type?: string;
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

  type(type: string) {
    this.#state.type = type;
    return this;
  }

  required(apply = true) {
    this.#state.required = apply;
    return this;
  }

  default(value: string | null) {
    this.#state.value = value;
    return this;
  }

  build() {
    const { table, name, type, required, value, check } = this.#state;

    if (!table.building) {
      return table.build();
    }

    const columnName = escapeSqlName(name);

    const clause = ['ALTER COLUMN'];

    if (check) {
      clause.push('IF NOT EXISTS');
    }

    clause.push(columnName);

    if (type) {
      clause.push('TYPE', type, 'USING', `${columnName}::${type}`);
    }

    if (value) {
      clause.push('SET DEFAULT', value);
    } else if (value === null) {
      clause.push('DROP DEFAULT');
    }

    if (required) {
      clause.push('SET NOT null');
    } else if (required === false) {
      clause.push('DROP NOT null');
    }

    return clause.join(' ');
  }
}
