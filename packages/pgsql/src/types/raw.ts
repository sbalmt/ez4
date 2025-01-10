import type { SqlStatement } from './statement.js';

export type SqlRawGenerator = (statement?: SqlStatement) => string;

export class SqlRaw {
  #state: {
    statement?: SqlStatement;
    value: unknown | SqlRawGenerator;
  };

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
