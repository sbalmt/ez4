import type { SqlIndexStatement } from '../../statements/index.js';

import { escapeSqlName } from '../../utils/escape.js';

export class SqlRenameIndexClause {
  #state: {
    index: SqlIndexStatement;
    name: string;
  };

  constructor(index: SqlIndexStatement, name: string) {
    this.#state = {
      index,
      name
    };
  }

  to(name: string) {
    this.#state.name = name;
  }

  build() {
    const { index, name } = this.#state;

    const statement = ['ALTER INDEX', escapeSqlName(index.name), 'RENAME TO', escapeSqlName(name)];

    return statement.join(' ');
  }
}
