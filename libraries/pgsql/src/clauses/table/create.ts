import type { SqlTableStatement } from '../../statements/table.js';

import { escapeSqlName } from '../../utils/escape.js';

type ColumnData = {
  name: string;
  type: string;
  value?: string | null;
  required?: boolean;
};

export class SqlCreateTableClause {
  #state: {
    table: SqlTableStatement;
    columns: ColumnData[];
    check?: boolean;
  };

  constructor(table: SqlTableStatement) {
    this.#state = {
      columns: [],
      table
    };
  }

  get conditional() {
    return this.#state.check;
  }

  missing(check = true) {
    this.#state.check = check;

    return this;
  }

  column(name: string, type: string, required?: boolean, value?: string) {
    this.#state.columns.push({ name, type, required, value });

    return this;
  }

  build() {
    const { table, columns, check } = this.#state;

    const statement = ['CREATE TABLE'];

    if (check) {
      statement.push('IF NOT EXISTS');
    }

    const definitions = getColumnDefinitions(columns);

    statement.push(escapeSqlName(table.name), `(${definitions.join(', ')})`);

    return statement.join(' ');
  }
}

const getColumnDefinitions = (columns: ColumnData[]) => {
  const allDefinitions = [];

  for (const column of columns) {
    const definition = [escapeSqlName(column.name), column.type];

    if (column.value) {
      definition.push('DEFAULT', column.value);
    }

    if (column.required) {
      definition.push('NOT null');
    }

    allDefinitions.push(definition.join(' '));
  }

  return allDefinitions;
};
