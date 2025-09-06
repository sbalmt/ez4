import type { SqlBuilderOptions, SqlBuilderReferences } from '../../builder';
import type { SqlSource } from '../../common/source';
import type { SqlFilters } from '../../common/types';

import { SqlConditions } from '../../operations/conditions';

export class SqlWhereClause extends SqlConditions {
  #state: {
    source: SqlSource;
    filters: SqlFilters;
  };

  constructor(source: SqlSource, references: SqlBuilderReferences, options: SqlBuilderOptions, filters: SqlFilters = {}) {
    super(source, references, options, filters);

    this.#state = {
      source,
      filters
    };
  }

  build(): [string, unknown[]] | undefined {
    const { source } = this.#state;

    if (!source.building) {
      return source.build();
    }

    const result = super.build();

    if (result) {
      const [clause, variables] = result;

      return [`WHERE ${clause}`, variables];
    }

    return undefined;
  }
}
