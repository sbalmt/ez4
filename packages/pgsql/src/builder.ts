import { SqlSelectColumn, SqlSelectStatement } from './statements/select.js';
import { SqlInsertStatement } from './statements/insert.js';
import { SqlUpdateStatement } from './statements/update.js';
import { SqlDeleteStatement } from './statements/delete.js';

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

  select(...columns: SqlSelectColumn[]) {
    return new SqlSelectStatement({
      references: this.#references,
      columns
    });
  }

  insert(table?: string, record?: Record<string, unknown>) {
    return new SqlInsertStatement({
      references: this.#references,
      record,
      table
    });
  }

  update(table?: string, record?: Record<string, unknown>) {
    return new SqlUpdateStatement({
      references: this.#references,
      record,
      table
    });
  }

  delete(table?: string) {
    return new SqlDeleteStatement({
      references: this.#references,
      table
    });
  }
}
