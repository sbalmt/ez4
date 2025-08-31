import type { SqlBuilderReferences } from '../../builder.js';
import type { SqlSource } from '../../common/source.js';

import { escapeSqlName } from '../../utils/escape.js';
import { getUniqueAlias } from '../../helpers/alias.js';
import { NoStatementsError } from '../errors.js';

type SqlWithContext = {
  variables: unknown[];
  references: SqlBuilderReferences;
  alias: string;
};

export class SqlWithClause {
  #state: {
    sources: SqlSource[];
    references: SqlBuilderReferences;
    alias: string;
  };

  constructor(sources: SqlSource[], references: SqlBuilderReferences, alias?: string) {
    this.#state = {
      alias: alias || 'Q',
      references,
      sources
    };
  }

  build(): [string, unknown[]] {
    const { sources, references, alias } = this.#state;

    if (sources.length === 0) {
      throw new NoStatementsError();
    }

    if (sources.length === 1) {
      return sources[0].build();
    }

    const variables: unknown[] = [];

    const queries = getQueries(sources, { variables, references, alias });
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
  const { variables, references, alias } = context;

  const lastQuery = statements[statements.length - 1];
  const allQueries = [];

  let previousQuery;
  let previousAlias;

  for (const currentQuery of statements) {
    previousQuery?.as(previousAlias);

    const [innerStatement, innerVariables] = currentQuery.build();

    variables.push(...innerVariables);

    if (currentQuery === lastQuery) {
      allQueries.push(innerStatement);
      continue;
    }

    const currentAlias = getUniqueAlias(alias, references);

    allQueries.push(`${escapeSqlName(currentAlias)} AS (${innerStatement})`);

    previousQuery = currentQuery;
    previousAlias = currentAlias;
  }

  return allQueries;
};
