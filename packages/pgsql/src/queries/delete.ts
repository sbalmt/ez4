import type { SqlFilters } from '../types/common.js';
import type { SqlResultColumn, SqlResults } from '../types/results.js';
import type { SqlBuilderReferences } from '../builder.js';

import { escapeName } from '../utils.js';
import { MissingTableError } from '../errors/table.js';
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

export type SqlDeleteStatementWithResults = SqlDeleteStatement & {
  readonly results: SqlResults;
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

  from(table: string): SqlDeleteStatement {
    this.#state.table = table;

    return this;
  }

  as(alias: string | undefined): SqlDeleteStatement {
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

  returning(...columns: SqlResultColumn[]): SqlDeleteStatementWithResults {
    if (!this.#state.returning) {
      this.#state.returning = new SqlReturningClause(this, columns);
    } else if (columns.length > 0) {
      this.#state.returning.columns(...columns);
    }

    return this as unknown as SqlDeleteStatementWithResults;
  }

  build(): [string, unknown[]] {
    const { table, alias, where, returning } = this.#state;

    if (!table) {
      throw new MissingTableError();
    }

    const statement = [`DELETE FROM ${escapeName(table)}`];
    const variables = [];

    if (alias) {
      statement.push(`AS ${escapeName(alias)}`);
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
