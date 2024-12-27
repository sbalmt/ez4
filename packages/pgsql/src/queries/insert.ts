import type { SqlRecord } from '../types/common.js';
import type { SqlResultColumn, SqlResults } from '../types/results.js';
import type { SqlBuilderReferences } from '../builder.js';

import { isEmptyObject } from '@ez4/utils';

import { escapeName } from '../utils.js';
import { MissingTableError } from '../errors/table.js';
import { SqlReturningClause } from '../types/returning.js';
import { SqlStatement } from '../types/statement.js';
import { SqlSelectStatement } from './select.js';

type SqlInsertState = {
  references: SqlBuilderReferences;
  returning?: SqlReturningClause;
  record?: SqlRecord;
  table?: string;
  alias?: string;
};

export type SqlInsertStatementWithResults = SqlInsertStatement & {
  readonly results: SqlResults;
};

export class SqlInsertStatement extends SqlStatement {
  #state: SqlInsertState;

  constructor(
    table: string | undefined,
    record: SqlRecord | undefined,
    references: SqlBuilderReferences
  ) {
    super();

    this.#state = {
      references,
      record,
      table
    };
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

  get results() {
    return this.#state.returning?.results;
  }

  into(table: string): SqlInsertStatement {
    this.#state.table = table;

    return this;
  }

  as(alias: string | undefined): SqlInsertStatement {
    this.#state.alias = alias;

    return this;
  }

  record(record: SqlRecord): SqlInsertStatement {
    this.#state.record = record;

    return this;
  }

  returning(...columns: SqlResultColumn[]): SqlInsertStatementWithResults {
    if (!this.#state.returning) {
      this.#state.returning = new SqlReturningClause(this, columns);
    } else if (columns.length > 0) {
      this.#state.returning.columns(...columns);
    }

    return this as unknown as SqlInsertStatementWithResults;
  }

  build(): [string, unknown[]] {
    const { table, alias, record, returning } = this.#state;

    if (!table) {
      throw new MissingTableError();
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

    if (returning && !returning.empty) {
      const [returningClause, returningVariables] = returning.build();

      variables.push(...returningVariables);
      statement.push(returningClause);
    }

    return [statement.join(' '), variables];
  }
}

const getColumnsName = (columns: string[]) => {
  return columns.map((column) => escapeName(column)).join(', ');
};

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
