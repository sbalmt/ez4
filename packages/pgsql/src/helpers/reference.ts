import type { SqlStatement } from '../types.js';

import { escapeColumn } from '../utils.js';

type SqlColumnReferenceState = {
  statement: SqlStatement;
  name: string;
};

export class SqlColumnReference {
  #state: SqlColumnReferenceState;

  constructor(state: SqlColumnReferenceState) {
    this.#state = state;
  }

  toString() {
    const { statement, name } = this.#state;

    if (statement.alias) {
      return `${escapeColumn(statement.alias)}.${escapeColumn(name)}`;
    }

    return escapeColumn(name);
  }
}
