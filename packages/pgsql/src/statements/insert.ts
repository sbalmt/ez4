import type { SqlColumnName, SqlStatement, SqlStatementRecord } from '../types.js';
import type { SqlBuilderReferences } from '../builder.js';

import { isEmptyObject } from '@ez4/utils';

import { escapeName } from '../utils.js';
import { MissingTableNameError } from '../errors/table.js';
import { getReturningColumns } from '../helpers/returning.js';
import { SqlSelectStatement } from './select.js';

type SqlInsertState = {
  references: SqlBuilderReferences;
  returning?: SqlColumnName[];
  record?: SqlStatementRecord;
  table?: string;
  alias?: string;
};

export class SqlInsertStatement implements SqlStatement {
  #state: SqlInsertState;

  constructor(state: SqlInsertState) {
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

  into(table: string): SqlInsertStatement {
    this.#state.table = table;

    return this;
  }

  as(alias: string | undefined): SqlInsertStatement {
    this.#state.alias = alias;

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

  build(): [string, unknown[]] {
    const { table, alias, record, returning } = this.#state;

    if (!table) {
      throw new MissingTableNameError();
    }

    const statement = [`INSERT INTO ${escapeName(table)}`];
    const variables: unknown[] = [];

    if (alias) {
      statement.push(`AS ${escapeName(alias)}`);
    }

    const hasRecord = record && !isEmptyObject(record);

    statement.push(hasRecord ? `(${getColumnsName(this.fields)})` : 'DEFAULT');

    statement.push('VALUES');

    if (hasRecord) {
      statement.push(`(${getValueReferences(this.values, variables)})`);
    }

    if (returning?.length) {
      statement.push(`RETURNING ${getReturningColumns(returning)}`);
    }

    return [statement.join(' '), variables];
  }
}

const getValueReferences = (values: unknown[], variables: unknown[]) => {
  let index = 0;

  const referenceList = values.map((value) => {
    if (value instanceof SqlSelectStatement) {
      const [selectStatement, selectVariables] = value.build();

      variables.push(...selectVariables);

      return `(${selectStatement})`;
    }

    variables.push(value);

    return `:${index++}`;
  });

  return referenceList.join(', ');
};

const getColumnsName = (columns: string[]) => {
  return columns.map((column) => escapeName(column)).join(', ');
};
