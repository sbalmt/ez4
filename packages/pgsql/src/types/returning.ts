import type { SqlJsonColumnOptions, SqlJsonColumnSchema } from '../types/json.js';
import type { SqlArrayColumn, SqlObjectColumn, SqlResultColumn } from '../types/results.js';
import type { SqlStatement } from '../types/statement.js';

import { SqlResults } from '../types/results.js';
import { SqlJsonColumn } from '../types/json.js';

type SqlReturningState = {
  results: SqlResults;
};

export class SqlReturningClause {
  #state: SqlReturningState;

  constructor(statement: SqlStatement, columns: (SqlResultColumn | SqlJsonColumn)[]) {
    this.#state = {
      results: new SqlResults(statement, columns)
    };
  }

  get results() {
    return this.#state.results;
  }

  get empty() {
    return this.#state.results.empty;
  }

  columns(...columns: SqlResultColumn[]) {
    this.#state.results.reset(...columns);

    return this;
  }

  column(column: SqlResultColumn) {
    this.#state.results.column(column);

    return this;
  }

  jsonColumn(schema: SqlJsonColumnSchema, options: SqlJsonColumnOptions) {
    this.#state.results.jsonColumn(schema, options);

    return this;
  }

  objectColumn(schema: SqlJsonColumnSchema, options?: SqlObjectColumn) {
    this.#state.results.objectColumn(schema, options);

    return this;
  }

  arrayColumn(schema: SqlJsonColumnSchema, options?: SqlArrayColumn) {
    this.#state.results.arrayColumn(schema, options);

    return this;
  }

  build(): [string, unknown[]] {
    const { results } = this.#state;

    const [resultColumns, variables] = results.build();

    return [`RETURNING ${resultColumns}`, variables];
  }
}
