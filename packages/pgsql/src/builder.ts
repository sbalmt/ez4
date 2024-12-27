import { SqlSelectStatement } from './queries/select.js';
import { SqlInsertStatement } from './queries/insert.js';
import { SqlUpdateStatement } from './queries/update.js';
import { SqlDeleteStatement } from './queries/delete.js';
import { SqlResultColumn } from './types/results.js';

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

  select(...columns: SqlResultColumn[]) {
    return new SqlSelectStatement(columns, this.#references);
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
