import type { SqlArrayColumn, SqlObjectColumn, SqlResultColumn, SqlResultRecord } from '../../common/results';
import type { SqlJsonColumnOptions, SqlJsonColumnRecord } from '../../common/json';
import type { SqlBuilderReferences } from '../../builder';
import type { SqlSource } from '../../common/source';

import { SqlResults } from '../../common/results';

export class SqlReturningClause {
  #state: {
    results: SqlResults;
  };

  constructor(source: SqlSource, references: SqlBuilderReferences, columns?: SqlResultRecord | SqlResultColumn[]) {
    this.#state = {
      results: new SqlResults(source, references, columns)
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

  jsonColumn(record: SqlJsonColumnRecord, options: SqlJsonColumnOptions) {
    this.#state.results.jsonColumn(record, options);
    return this;
  }

  objectColumn(record: SqlJsonColumnRecord, options?: SqlObjectColumn) {
    this.#state.results.objectColumn(record, options);
    return this;
  }

  arrayColumn(record: SqlJsonColumnRecord, options?: SqlArrayColumn) {
    this.#state.results.arrayColumn(record, options);
    return this;
  }

  build(): [string, unknown[]] {
    const { results } = this.#state;

    const [resultColumns, variables] = results.build();

    return [`RETURNING ${resultColumns}`, variables];
  }
}
