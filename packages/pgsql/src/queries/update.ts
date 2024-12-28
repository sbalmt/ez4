import type { SqlFilters, SqlRecord } from '../types/common.js';
import type { SqlResultColumn, SqlResultRecord } from '../types/results.js';
import type { SqlBuilderReferences } from '../builder.js';

import { isAnyObject } from '@ez4/utils';

import { mergeSqlPath } from '../utils/merge.js';
import { escapeSqlName } from '../utils/escape.js';
import { MissingTableError } from '../errors/table.js';
import { MissingRecordError } from '../errors/record.js';
import { SqlReturningClause } from '../types/returning.js';
import { SqlStatement } from '../types/statement.js';
import { SqlReference } from '../types/reference.js';
import { SqlWhereClause } from '../types/where.js';
import { SqlSelectStatement } from './select.js';

type SqlUpdateContext = {
  references: SqlBuilderReferences;
  variables: unknown[];
  parent?: string;
};

type SqlUpdateState = {
  references: SqlBuilderReferences;
  returning?: SqlReturningClause;
  record?: SqlRecord;
  source?: SqlStatement;
  where?: SqlWhereClause;
  table?: string;
  alias?: string;
};

export class SqlUpdateStatement extends SqlStatement {
  #state: SqlUpdateState;

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

  get filters() {
    return this.#state.where;
  }

  get results() {
    return this.#state.returning?.results;
  }

  only(table: string) {
    this.#state.table = table;

    return this;
  }

  from(table: SqlStatement | undefined) {
    this.#state.source = table;

    return this;
  }

  as(alias: string | undefined) {
    this.#state.alias = alias;

    return this;
  }

  record(record: SqlRecord) {
    this.#state.record = record;

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

  returning(result?: SqlResultRecord | SqlResultColumn[]) {
    if (!this.#state.returning) {
      this.#state.returning = new SqlReturningClause(this, result);
    } else {
      this.#state.returning.reset(result);
    }

    return this;
  }

  build(): [string, unknown[]] {
    const { table, alias, references, record, source, where, returning } = this.#state;

    if (!table) {
      throw new MissingTableError();
    }

    const statement = [`UPDATE ONLY ${escapeSqlName(table)}`];
    const variables: unknown[] = [];

    if (alias) {
      statement.push(`AS ${escapeSqlName(alias)}`);
    }

    if (!record) {
      throw new MissingRecordError();
    }

    statement.push(`SET ${getUpdateColumns(record, { variables, references })}`);

    if (source?.alias) {
      statement.push(`FROM ${escapeSqlName(source.alias)}`);
    }

    if (where && !where.empty) {
      const [whereClause, whereVariables] = where.build();

      statement.push(whereClause);
      variables.push(...whereVariables);
    }

    if (returning && !returning.empty) {
      const [returningClause, returningVariables] = returning.build();

      variables.push(...returningVariables);
      statement.push(returningClause);
    }

    return [statement.join(' '), variables];
  }
}

const getUpdateColumns = (record: SqlRecord, context: SqlUpdateContext): string => {
  const { variables, references, parent } = context;

  const updates = [];

  for (const field in record) {
    const value = record[field];

    if (value === undefined) {
      continue;
    }

    const columnName = mergeSqlPath(field, parent);

    if (value instanceof SqlReference) {
      updates.push(`${columnName} = ${value.build()}`);
      continue;
    }

    if (value instanceof SqlSelectStatement) {
      const [selectStatement, selectVariables] = value.build();

      updates.push(`${columnName} = (${selectStatement})`);
      variables.push(...selectVariables);

      continue;
    }

    if (isAnyObject(value)) {
      updates.push(getUpdateColumns(value, { ...context, parent: columnName }));

      continue;
    }

    updates.push(`${columnName} = :${references.counter++}`);
    variables.push(value);
  }

  return updates.join(', ');
};
