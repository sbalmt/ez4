import type { SqlColumnName, SqlStatementRecord, SqlBuilderReferences } from '../types.js';
import type { SqlWhereFilters } from '../helpers/where.js';

import { escapeName } from '../utils.js';
import { MissingRecordError } from '../errors/record.js';
import { MissingTableNameError } from '../errors/table.js';
import { getReturningColumns } from '../helpers/returning.js';
import { SqlWhereClause } from '../helpers/where.js';
import { SqlSelectStatement } from './select.js';

export type SqlUpdateState = {
  references: SqlBuilderReferences;
  returning?: SqlColumnName[];
  record?: SqlStatementRecord;
  where?: SqlWhereClause;
  table?: string;
};

export class SqlUpdateStatement {
  #state: SqlUpdateState;

  constructor(state: SqlUpdateState) {
    this.#state = state;
  }

  get alias() {
    return this.#state.references.alias;
  }

  get fields() {
    return this.#state.record ? Object.keys(this.#state.record) : [];
  }

  get values() {
    return this.#state.record ? Object.values(this.#state.record) : [];
  }

  only(table: string): SqlUpdateStatement {
    this.#state.table = table;

    return this;
  }

  as(alias: string | undefined): SqlUpdateStatement {
    this.#state.references.alias = alias;
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
        filters: filters ?? {}
      });
    }

    return this.#state.where;
  }

  returning(...columns: SqlColumnName[]): SqlUpdateStatement {
    this.#state.returning = columns;

    return this;
  }

  toString() {
    const { table, references, record, where, returning } = this.#state;

    if (!table) {
      throw new MissingTableNameError();
    }

    references.counter = 0;

    const statement = [`UPDATE ONLY ${escapeName(table)}`];

    if (references.alias) {
      statement.push(`AS ${escapeName(references.alias)}`);
    }

    if (!record) {
      throw new MissingRecordError();
    }

    statement.push(`SET ${getUpdateValues(record, references)}`);

    if (where) {
      statement.push(where.toString());
    }

    if (returning?.length) {
      statement.push(`RETURNING ${getReturningColumns(returning)}`);
    }

    return statement.join(' ');
  }
}

export const updateQuery = (table?: string, record?: Record<string, unknown>) => {
  return new SqlUpdateStatement({
    references: { counter: 0 },
    record,
    table
  });
};

const getUpdateValues = (record: SqlStatementRecord, references: SqlBuilderReferences) => {
  const updates = [];

  for (const field in record) {
    const value = record[field];

    if (value === undefined) {
      continue;
    }

    const fieldName = escapeName(field);

    if (!(value instanceof SqlSelectStatement)) {
      updates.push(`${fieldName} = :${references.counter++}`);
      continue;
    }

    updates.push(`${fieldName} = (${value})`);
  }

  return updates.join(', ');
};
