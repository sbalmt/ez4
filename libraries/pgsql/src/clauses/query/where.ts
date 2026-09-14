import type { SqlBuilderOptions, SqlBuilderReferences } from '../../builder';
import type { SqlSource } from '../../common/source';
import type { SqlFilters } from '../../common/types';

import { SqlConditions } from '../../operations/conditions';

export class SqlWhereClause {
  #state: {
    source: SqlSource;
    filters: SqlConditions;
  };

  constructor(source: SqlSource, references: SqlBuilderReferences, options: SqlBuilderOptions, filters: SqlFilters = {}) {
    this.#state = {
      filters: new SqlConditions(source, references, options, filters),
      source
    };
  }

  get empty() {
    return this.#state.filters.empty;
  }

  apply(filters: SqlFilters) {
    this.#state.filters.apply(filters);
    return this;
  }

  merge(filters: SqlFilters) {
    this.#state.filters.merge(filters);
    return this;
  }

  build(): [string, unknown[]] | undefined {
    const { source, filters } = this.#state;

    if (!source.building) {
      return source.build();
    }

    const result = filters.build();

    if (result) {
      const [clause, variables] = result;

      return [`WHERE ${clause}`, variables];
    }

    return undefined;
  }
}
