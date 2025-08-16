import type { SqlAlterTableClause } from '../table/alter.js';

import { escapeSqlName } from '../../utils/escape.js';

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
    const { table, name, type, required, value } = this.#state;

    if (!table.building) {
      return table.build();
    }

    const columnName = escapeSqlName(name);

    const clause = ['ALTER COLUMN', columnName];

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
