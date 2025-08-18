import type { SqlAlterTableClause } from '../table/alter.js';

import { escapeSqlName } from '../../utils/escape.js';
import { MissingClauseError } from '../errors.js';

export class SqlAlterColumnClause {
  #state: {
    table: SqlAlterTableClause;
    name: string;
    required?: boolean;
    value?: string | null;
    type?: string;
  };

  constructor(table: SqlAlterTableClause, name: string) {
    this.#state = {
      table,
      name
    };
  }

  get name() {
    return this.#state.name;
  }

  get empty() {
    return !this.#state.type && !this.#state.value && this.#state.required === undefined;
  }

  type(type?: string) {
    this.#state.type = type;
    return this;
  }

  required(apply = true) {
    this.#state.required = apply;
    return this;
  }

  default(value?: string | null) {
    this.#state.value = value;
    return this;
  }

  build() {
    const { table, name, type, required, value } = this.#state;

    if (!table.building) {
      return table.build();
    }

    const columnName = escapeSqlName(name);

    const base = ['ALTER COLUMN', columnName];
    const clauses = [];

    if (type) {
      clauses.push([...base, 'TYPE', type, 'USING', `${columnName}::${type}`]);
    }

    if (value) {
      clauses.push([...base, 'SET', 'DEFAULT', value]);
    } else if (value === null) {
      clauses.push([...base, 'DROP', 'DEFAULT']);
    }

    if (required) {
      clauses.push([...base, 'SET', 'NOT', 'null']);
    } else if (required === false) {
      clauses.push([...base, 'DROP', 'NOT', 'null']);
    }

    if (!clauses.length) {
      throw new MissingClauseError();
    }

    return clauses.map((clause) => clause.join(' ')).join(', ');
  }
}
