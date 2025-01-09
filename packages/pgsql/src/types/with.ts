import type { SqlStatement } from './statement.js';

import { NoStatementsError } from '../errors/queries.js';
import { escapeSqlName } from '../utils/escape.js';

type SqlWithContext = {
  variables: unknown[];
  alias: string;
};

export class SqlWithClause {
  #state: {
    statements: SqlStatement[];
    alias: string;
  };

  constructor(statements: SqlStatement[], alias?: string) {
    this.#state = {
      alias: alias || 'R',
      statements
    };
  }

  build(): [string, unknown[]] {
    const { statements, alias } = this.#state;

    if (statements.length === 0) {
      throw new NoStatementsError();
    }

    if (statements.length === 1) {
      return statements[0].build();
    }

    const variables: unknown[] = [];

    const queries = getQueries(statements, { variables, alias });
    const clause = ['WITH'];

    const lastQuery = queries.splice(-1);

    if (queries.length > 0) {
      clause.push(queries.join(', '));
    }

    clause.push(...lastQuery);

    return [clause.join(' '), variables];
  }
}

const getQueries = (statements: SqlStatement[], context: SqlWithContext) => {
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
