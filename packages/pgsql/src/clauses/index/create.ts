import type { SqlIndexStatement } from '../../statements/index.js';

import { escapeSqlName, escapeSqlNames } from '../../utils/escape.js';

export class SqlCreateIndexClause {
  #state: {
    index: SqlIndexStatement;
    concurrently?: boolean;
    check?: boolean;
    columns: string[];
    table: string;
  };

  constructor(index: SqlIndexStatement, table: string, columns: string[] = []) {
    this.#state = {
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

  columns(columns: string[]) {
    this.#state.columns = columns;

    return this;
  }

  column(column: string) {
    this.#state.columns.push(column);

    return this;
  }

  build() {
    const { index, table, check, concurrently, columns } = this.#state;

    const statement = ['CREATE INDEX'];

    if (concurrently) {
      statement.push('CONCURRENTLY');
    }

    if (check) {
      statement.push('IF NOT EXISTS');
    }

    statement.push(escapeSqlName(index.name), 'ON', escapeSqlName(table), `(${escapeSqlNames(columns)})`);

    return statement.join(' ');
  }
}
