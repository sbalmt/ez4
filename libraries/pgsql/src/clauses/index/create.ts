import type { SqlIndexStatement } from '../../statements/index';

import { escapeSqlName, escapeSqlNames } from '../../utils/escape';

export class SqlCreateIndexClause {
  #state: {
    index: SqlIndexStatement;
    concurrently?: boolean;
    unique?: boolean;
    check: boolean;
    columns: string[];
    table: string;
    type?: string;
  };

  constructor(index: SqlIndexStatement, table: string, columns: string[] = []) {
    this.#state = {
      check: false,
      columns,
      table,
      index
    };
  }

  get conditional() {
    return this.#state.check;
  }

  get concurrently() {
    return this.#state.concurrently;
  }

  missing(check = true) {
    this.#state.check = check;

    return this;
  }

  concurrent(apply = true) {
    this.#state.concurrently = apply;

    return this;
  }

  unique(apply = true) {
    this.#state.unique = apply;

    return this;
  }

  columns(columns: string[]) {
    this.#state.columns = columns;

    return this;
  }

  column(column: string) {
    this.#state.columns.push(column);

    return this;
  }

  type(type: string) {
    this.#state.type = type;

    return this;
  }

  build() {
    const { index, table, check, concurrently, unique, columns, type } = this.#state;

    const statement = ['CREATE'];

    if (unique) {
      statement.push('UNIQUE');
    }

    statement.push('INDEX');

    if (concurrently) {
      statement.push('CONCURRENTLY');
    }

    if (check) {
      statement.push('IF', 'NOT', 'EXISTS');
    }

    statement.push(escapeSqlName(index.name), 'ON', escapeSqlName(table));

    if (type) {
      statement.push('USING', type);
    }

    statement.push(`(${escapeSqlNames(columns)})`);

    return statement.join(' ');
  }
}
