import type { SqlIndexStatement } from '../../statements/index';

import { escapeSqlName } from '../../utils/escape';

export class SqlRenameIndexClause {
  #state: {
    index: SqlIndexStatement;
    name: string;
    check: boolean;
  };

  constructor(index: SqlIndexStatement, name: string) {
    this.#state = {
      check: false,
      index,
      name
    };
  }

  get conditional() {
    return this.#state.check;
  }

  to(name: string) {
    this.#state.name = name;
  }

  existing(check = true) {
    this.#state.check = check;

    return this;
  }

  build() {
    const { index, name, check } = this.#state;

    const statement = ['ALTER', 'INDEX'];

    if (check) {
      statement.push('IF', 'EXISTS');
    }

    statement.push(escapeSqlName(index.name), 'RENAME', 'TO', escapeSqlName(name));

    return statement.join(' ');
  }
}
