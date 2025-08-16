import type { SqlSource } from '../../common/source.js';

import { escapeSqlName } from '../../utils/escape.js';
import { NoStatementsError } from '../errors.js';

type SqlWithContext = {
  variables: unknown[];
  alias: string;
};

export class SqlWithClause {
  #state: {
    sources: SqlSource[];
    alias: string;
  };

  constructor(sources: SqlSource[], alias?: string) {
    this.#state = {
      alias: alias || 'R',
      sources
    };
  }

  build(): [string, unknown[]] {
    const { sources, alias } = this.#state;

    if (sources.length === 0) {
      throw new NoStatementsError();
    }

    if (sources.length === 1) {
      return sources[0].build();
    }

    const variables: unknown[] = [];

    const queries = getQueries(sources, { variables, alias });
    const clause = ['WITH'];

    const lastQuery = queries.splice(-1);

    if (queries.length > 0) {
      clause.push(queries.join(', '));
    }

    clause.push(...lastQuery);

    return [clause.join(' '), variables];
  }
}

const getQueries = (statements: SqlSource[], context: SqlWithContext) => {
  const { variables, alias } = context;

  const queries = [];

  let previousQuery;
  let previousAlias;

  let counter = 0;

  for (const currentQuery of statements) {
    previousQuery?.as(previousAlias);

    const [innerStatement, innerVariables] = currentQuery.build();

    variables.push(...innerVariables);

    if (counter + 1 === statements.length) {
      queries.push(innerStatement);
      continue;
    }

    const currentAlias = `${alias}${counter++}`;

    queries.push(`${escapeSqlName(currentAlias)} AS (${innerStatement})`);

    previousQuery = currentQuery;
    previousAlias = currentAlias;
  }

  return queries;
};
