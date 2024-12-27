import type { SqlWhereFilters } from '../helpers/where.js';
import type { SqlColumnName, SqlStatement, SqlStatementRecord } from '../types.js';
import type { SqlBuilderReferences } from '../builder.js';

import { escapeName } from '../utils.js';
import { MissingRecordError } from '../errors/record.js';
import { MissingTableNameError } from '../errors/table.js';
import { getReturningColumns } from '../helpers/returning.js';
import { SqlWhereClause } from '../helpers/where.js';
import { SqlSelectStatement } from './select.js';

type SqlUpdateState = {
  references: SqlBuilderReferences;
  returning?: SqlColumnName[];
  record?: SqlStatementRecord;
  where?: SqlWhereClause;
  table?: string;
  alias?: string;
};

export class SqlUpdateStatement implements SqlStatement {
  #state: SqlUpdateState;

  constructor(state: SqlUpdateState) {
    this.#state = state;
  }

  get alias() {
    return this.#state.alias;
  }

  get fields() {
    return this.#state.record ? Object.keys(this.#state.record) : [];
  }

  get values() {
    return this.#state.record ? Object.values(this.#state.record) : [];
  }

  get filters() {
    return this.#state.where;
  }

  only(table: string): SqlUpdateStatement {
    this.#state.table = table;

    return this;
  }

  as(alias: string | undefined): SqlUpdateStatement {
    this.#state.alias = alias;

    return this;
  }

  record(record: SqlStatementRecord): SqlUpdateStatement {
    this.#state.record = record;

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

  returning(...columns: SqlColumnName[]): SqlUpdateStatement {
    this.#state.returning = columns;

    return this;
  }

  build(): [string, unknown[]] {
    const { table, alias, references, record, where, returning } = this.#state;

    if (!table) {
      throw new MissingTableNameError();
    }

    const statement = [`UPDATE ONLY ${escapeName(table)}`];
    const variables: unknown[] = [];

    if (alias) {
      statement.push(`AS ${escapeName(alias)}`);
    }

    if (!record) {
      throw new MissingRecordError();
    }

    statement.push(`SET ${getUpdateValues(record, variables, references)}`);

    if (where && !where.empty) {
      const [whereClause, whereVariables] = where.build();

      statement.push(whereClause);
      variables.push(...whereVariables);
    }

    if (returning?.length) {
      statement.push(`RETURNING ${getReturningColumns(returning)}`);
    }

    return [statement.join(' '), variables];
  }
}

const getUpdateValues = (
  record: SqlStatementRecord,
  variables: unknown[],
  references: SqlBuilderReferences
) => {
  const updates = [];

  for (const field in record) {
    const value = record[field];

    if (value === undefined) {
      continue;
    }

    const fieldName = escapeName(field);

    if (value instanceof SqlSelectStatement) {
      const [selectStatement, selectVariables] = value.build();

      updates.push(`${fieldName} = (${selectStatement})`);
      variables.push(...selectVariables);

      continue;
    }

    updates.push(`${fieldName} = :${references.counter++}`);
    variables.push(value);
  }

  return updates.join(', ');
};
