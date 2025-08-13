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

    const statement = ['ALTER COLUMN'];

    if (check) {
      statement.push('IF NOT EXISTS');
    }

    statement.push(columnName);

    if (type) {
      statement.push('TYPE', type, `USING ${columnName}::${type}`);
    }

    if (value) {
      statement.push('SET DEFAULT', value);
    } else if (value === null) {
      statement.push('DROP DEFAULT');
    }

    if (required) {
      statement.push('SET NOT null');
    } else if (required === false) {
      statement.push('DROP NOT null');
    }

    return statement.join(' ');
  }
}
