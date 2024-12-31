import type { SqlStatement } from './statement.js';

import { escapeSqlName } from '../utils/escape.js';
import { mergeSqlAlias } from '../utils/merge.js';

export type SqlReferenceGenerator = (statement: SqlStatement) => string;

type SqlReferenceState = {
  statement: SqlStatement;
  column: string | SqlReferenceGenerator;
};

export class SqlReference {
  #state: SqlReferenceState;

  constructor(statement: SqlStatement, column: string | SqlReferenceGenerator) {
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

    if (statement.alias) {
      return mergeSqlAlias(escapeSqlName(column), statement.alias);
    }

    return escapeSqlName(column);
  }
}
