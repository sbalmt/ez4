import type { SqlBuilderReferences } from '../builder.js';
import type { SqlResultColumn, SqlResultRecord } from '../types/results.js';
import type { SqlStatementWithResults } from '../types/statement.js';
import type { SqlFilters } from '../types/common.js';

import { escapeSqlName } from '../utils/escape.js';
import { MissingTableNameError } from '../errors/queries.js';
import { SqlReturningClause } from '../types/returning.js';
import { SqlWhereClause } from '../types/where.js';
import { SqlStatement } from '../types/statement.js';

type SqlDeleteState = {
  references: SqlBuilderReferences;
  returning?: SqlReturningClause;
  where?: SqlWhereClause;
  table?: string;
  alias?: string;
};

export class SqlDeleteStatement extends SqlStatement {
  #state: SqlDeleteState;

  constructor(table: string | undefined, references: SqlBuilderReferences) {
    super();

    this.#state = {
      references,
      table
    };
  }

  get alias() {
    return this.#state.alias;
  }

  get filters() {
    return this.#state.where;
  }

  get results() {
    return this.#state.returning?.results;
  }

  from(table: string) {
    this.#state.table = table;

    return this;
  }

  as(alias: string | undefined) {
    this.#state.alias = alias;

    return this;
  }

  where(filters?: SqlFilters) {
    if (!this.#state.where) {
      this.#state.where = new SqlWhereClause(this, this.#state.references, filters);
    } else if (filters) {
      this.#state.where.apply(filters);
    }

    return this;
  }

  returning(
    result?: SqlResultRecord | SqlResultColumn[]
  ): SqlDeleteStatement & SqlStatementWithResults {
    if (!this.#state.returning) {
      this.#state.returning = new SqlReturningClause(this, result);
    } else {
      this.#state.returning.apply(result);
    }

    return this as any;
  }

  build(): [string, unknown[]] {
    const { table, alias, where, returning } = this.#state;

    if (!table) {
      throw new MissingTableNameError();
    }

    const statement = [`DELETE FROM ${escapeSqlName(table)}`];
    const variables = [];

    if (alias) {
      statement.push(`AS ${escapeSqlName(alias)}`);
    }

    if (where && !where.empty) {
      const [whereClause, whereVariables] = where.build();

      variables.push(...whereVariables);
      statement.push(whereClause);
    }

    if (returning && !returning.empty) {
      const [returningClause, returningVariables] = returning.build();

      variables.push(...returningVariables);
      statement.push(returningClause);
    }

    return [statement.join(' '), variables];
  }
}
