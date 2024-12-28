import type { SqlStatement } from './statement.js';

export type SqlRawColumnGenerator = (statement: SqlStatement) => string;

type SqlRawColumnState = {
  statement: SqlStatement;
  column: string | SqlRawColumnGenerator;
};

export class SqlRawColumn {
  #state: SqlRawColumnState;

  constructor(statement: SqlStatement, column: string | SqlRawColumnGenerator) {
    this.#state = {
      statement,
      column
    };
  }

  build() {
    const { statement, column } = this.#state;

    if (column instanceof Function) {
      return column(statement);
    }

    return column;
  }
}
