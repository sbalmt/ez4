import type { SqlSource } from '../../common/source';

import { NoStatementsError } from '../errors';

export class SqlUnionClause {
  #state: {
    sources: SqlSource[];
  };

  constructor(sources: SqlSource[]) {
    this.#state = {
      sources
    };
  }

  build(): [string, unknown[]] {
    const { sources } = this.#state;

    if (sources.length === 0) {
      throw new NoStatementsError();
    }

    if (sources.length === 1) {
      return sources[0].build();
    }

    const variables: unknown[] = [];
    const queries = [];

    for (const source of sources) {
      const [queryStatement, queryVariables] = source.build();

      variables.push(...queryVariables);
      queries.push(queryStatement);
    }

    return [queries.join(' UNION ALL '), variables];
  }
}
