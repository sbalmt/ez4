import type { SqlArrayColumn, SqlObjectColumn, SqlResultColumn, SqlResultRecord } from '../../common/results.js';
import type { SqlJsonColumnOptions, SqlJsonColumnSchema } from '../../common/json.js';
import type { SqlSource } from '../../common/source.js';

import { SqlResults } from '../../common/results.js';

export class SqlReturningClause {
  #state: {
    results: SqlResults;
  };

  constructor(source: SqlSource, columns?: SqlResultRecord | SqlResultColumn[]) {
    this.#state = {
      results: new SqlResults(source, columns)
    };
  }

  get results() {
    return this.#state.results;
  }

  get empty() {
    return this.#state.results.empty;
  }

  apply(result: SqlResultRecord | SqlResultColumn[]) {
    this.#state.results.reset(result);

    return this;
  }

  columns(...columns: SqlResultColumn[]) {
    this.#state.results.reset(columns);

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
