import type { SqlBuilderReferences, SqlColumnName, SqlStatementRecord } from '../types.js';

import { isEmptyObject } from '@ez4/utils';

import { escapeName } from '../utils.js';
import { MissingTableNameError } from '../errors/table.js';
import { getReturningColumns } from '../helpers/returning.js';
import { SqlSelectStatement } from './select.js';

export type SqlInsertState = {
  references: SqlBuilderReferences;
  returning?: SqlColumnName[];
  record?: SqlStatementRecord;
  table?: string;
};

export class SqlInsertStatement {
  #state: SqlInsertState;

  constructor(state: SqlInsertState) {
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

  into(table: string): SqlInsertStatement {
    this.#state.table = table;

    return this;
  }

  as(alias: string | undefined): SqlInsertStatement {
    this.#state.references.alias = alias;

    return this;
  }

  record(record: SqlStatementRecord): SqlInsertStatement {
    this.#state.record = record;

    return this;
  }

  returning(...columns: SqlColumnName[]): SqlInsertStatement {
    this.#state.returning = columns;

    return this;
  }

  toString() {
    const { table, references, record, returning } = this.#state;

    if (!table) {
      throw new MissingTableNameError();
    }

    const statement = [`INSERT INTO ${escapeName(table)}`];

    if (references.alias) {
      statement.push(`AS ${escapeName(references.alias)}`);
    }

    const hasRecord = record && !isEmptyObject(record);

    statement.push(hasRecord ? `(${getColumnsName(this.fields)})` : 'DEFAULT');

    statement.push('VALUES');

    if (hasRecord) {
      statement.push(`(${getValueReferences(this.values)})`);
    }

    if (returning?.length) {
      statement.push(`RETURNING ${getReturningColumns(returning)}`);
    }

    return statement.join(' ');
  }
}

export const insertQuery = (table?: string, record?: Record<string, unknown>) => {
  return new SqlInsertStatement({
    references: { counter: 0 },
    record,
    table
  });
};

const getValueReferences = (values: unknown[]) => {
  let index = 0;

  const referenceList = values.map((value) => {
    if (value instanceof SqlSelectStatement) {
      return `(${value})`;
    }

    return `:${index++}`;
  });

  return referenceList.join(', ');
};

const getColumnsName = (columns: string[]) => {
  return columns.map((column) => escapeName(column)).join(', ');
};
