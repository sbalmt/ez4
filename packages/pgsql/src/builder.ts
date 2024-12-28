import { SqlSelectStatement } from './queries/select.js';
import { SqlInsertStatement } from './queries/insert.js';
import { SqlUpdateStatement } from './queries/update.js';
import { SqlDeleteStatement } from './queries/delete.js';
import { SqlResultColumn, SqlResultRecord } from './types/results.js';
import { SqlStatement } from './main.js';
import { SqlWithClause } from './types/with.js';

export type SqlBuilderReferences = {
  counter: number;
};

export class SqlBuilder {
  #references: SqlBuilderReferences = {
    counter: 0
  };

  reset() {
    this.#references.counter = 0;

    return this;
  }

  with(statements: SqlStatement[], alias?: string) {
    return new SqlWithClause(statements, alias);
  }

  select(result?: SqlResultRecord | SqlResultColumn[]) {
    return new SqlSelectStatement(result, this.#references);
  }

  insert(table?: string, record?: Record<string, unknown>) {
    return new SqlInsertStatement(table, record, this.#references);
  }

  update(table?: string, record?: Record<string, unknown>) {
    return new SqlUpdateStatement(table, record, this.#references);
  }

  delete(table?: string) {
    return new SqlDeleteStatement(table, this.#references);
  }
}
