import type { SqlBuilderReferences, SqlColumnName } from '../types.js';
import type { SqlWhereFilters } from '../helpers/where.js';

import { escapeName } from '../utils.js';
import { MissingTableNameError } from '../errors/table.js';
import { getReturningColumns } from '../helpers/returning.js';
import { SqlWhereClause } from '../helpers/where.js';

export type SqlDeleteState = {
  references: SqlBuilderReferences;
  returning?: SqlColumnName[];
  where?: SqlWhereClause;
  table?: string;
};

export class SqlDeleteStatement {
  #state: SqlDeleteState;

  constructor(state: SqlDeleteState) {
    this.#state = state;
  }

  get alias() {
    return this.#state.references.alias;
  }

  from(table: string): SqlDeleteStatement {
    this.#state.table = table;

    return this;
  }

  as(alias: string | undefined): SqlDeleteStatement {
    this.#state.references.alias = alias;

    return this;
  }

  where(filters?: SqlWhereFilters) {
    if (!this.#state.where || filters) {
      this.#state.where = new SqlWhereClause({
        references: this.#state.references,
        filters: filters ?? {}
      });
    }

    return this.#state.where;
  }

  returning(...columns: SqlColumnName[]): SqlDeleteStatement {
    this.#state.returning = columns;
    return this;
  }

  toString() {
    const { table, references, where, returning } = this.#state;

    if (!table) {
      throw new MissingTableNameError();
    }

    const statement = [`DELETE FROM ${escapeName(table)}`];

    if (references.alias) {
      statement.push(`AS ${escapeName(references.alias)}`);
    }

    if (where) {
      statement.push(where.toString());
    }

    if (returning?.length) {
      statement.push(`RETURNING ${getReturningColumns(returning)}`);
    }

    return statement.join(' ');
  }
}

export const deleteQuery = (table?: string) => {
  return new SqlDeleteStatement({
    references: { counter: 0 },
    table
  });
};
