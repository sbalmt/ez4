import type { SqlStatement } from './statement.js';

export type SqlRawGenerator = (statement?: SqlStatement) => string;

type SqlRawState = {
  statement?: SqlStatement;
  value: unknown | SqlRawGenerator;
};

export class SqlRaw {
  #state: SqlRawState;

  constructor(statement: undefined | SqlStatement, value: unknown | SqlRawGenerator) {
    this.#state = {
      statement,
      value
    };
  }

  build() {
    const { statement, value } = this.#state;

    if (value instanceof Function) {
      return value(statement);
    }

    return value;
  }
}
