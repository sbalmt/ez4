import type { SqlWhereFilters } from '../helpers/where.js';
import type { SqlBuilderReferences } from '../builder.js';
import type { SqlColumnName, SqlStatement } from '../types.js';

import { escapeName } from '../utils.js';
import { MissingTableNameError } from '../errors/table.js';
import { getReturningColumns } from '../helpers/returning.js';
import { SqlWhereClause } from '../helpers/where.js';

type SqlDeleteState = {
  references: SqlBuilderReferences;
  returning?: SqlColumnName[];
  where?: SqlWhereClause;
  table?: string;
  alias?: string;
};

export class SqlDeleteStatement implements SqlStatement {
  #state: SqlDeleteState;

  constructor(state: SqlDeleteState) {
    this.#state = state;
  }

  get alias() {
    return this.#state.alias;
  }

  get filters() {
    return this.#state.where;
  }

  from(table: string): SqlDeleteStatement {
    this.#state.table = table;

    return this;
  }

  as(alias: string | undefined): SqlDeleteStatement {
    this.#state.alias = alias;

    return this;
  }

  where(filters?: SqlWhereFilters) {
    if (!this.#state.where || filters) {
      this.#state.where = new SqlWhereClause({
        references: this.#state.references,
        filters: filters ?? {},
        statement: this
      });
    }

    return this;
  }

  returning(...columns: SqlColumnName[]): SqlDeleteStatement {
    this.#state.returning = columns;
    return this;
  }

  build(): [string, unknown[]] {
    const { table, alias, where, returning } = this.#state;

    if (!table) {
      throw new MissingTableNameError();
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

    if (returning?.length) {
      statement.push(`RETURNING ${getReturningColumns(returning)}`);
    }

    return [statement.join(' '), variables];
  }
}
