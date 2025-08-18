import type { SqlIndexStatement } from '../../statements/index.js';

import { escapeSqlName } from '../../utils/escape.js';

export class SqlDropIndexClause {
  #state: {
    index: SqlIndexStatement;
    concurrently?: boolean;
    check: boolean;
  };

  constructor(index: SqlIndexStatement) {
    this.#state = {
      check: false,
      index
    };
  }

  get conditional() {
    return this.#state.check;
  }

  get concurrently() {
    return this.#state.concurrently;
  }

  existing(check = true) {
    this.#state.check = check;

    return this;
  }

  concurrent(apply = true) {
    this.#state.concurrently = apply;

    return this;
  }

  build() {
    const { index, check, concurrently } = this.#state;

    const statement = ['DROP', 'INDEX'];

    if (concurrently) {
      statement.push('CONCURRENTLY');
    }

    if (check) {
      statement.push('IF', 'EXISTS');
    }

    statement.push(escapeSqlName(index.name));

    return statement.join(' ');
  }
}
