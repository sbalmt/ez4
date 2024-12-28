import type { SqlStatement } from './statement.js';

import { escapeName, mergeAlias } from '../utils.js';

type SqlColumnReferenceState = {
  statement: SqlStatement;
  name: string;
};

export class SqlColumnReference {
  #state: SqlColumnReferenceState;

  constructor(state: SqlColumnReferenceState) {
    this.#state = state;
  }

  build() {
    const { statement, name } = this.#state;

    if (statement.alias) {
      return mergeAlias(escapeName(name), statement.alias);
    }

    return escapeName(name);
  }
}
