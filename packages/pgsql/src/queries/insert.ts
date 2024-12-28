import type { SqlBuilderReferences } from '../builder.js';
import type { SqlResultColumn, SqlResultRecord } from '../types/results.js';
import type { SqlRecord } from '../types/common.js';

import { isEmptyObject } from '@ez4/utils';

import { escapeSqlName } from '../utils/escape.js';
import { MissingTableError } from '../errors/table.js';
import { SqlReturningClause } from '../types/returning.js';
import { SqlReference } from '../types/reference.js';
import { SqlStatement } from '../types/statement.js';
import { SqlSelectStatement } from './select.js';

type SqlInsertContext = {
  references: SqlBuilderReferences;
  variables: unknown[];
};

type SqlInsertState = {
  references: SqlBuilderReferences;
  returning?: SqlReturningClause;
  record?: SqlRecord;
  source?: SqlStatement;
  table?: string;
  alias?: string;
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

  into(table: string) {
    this.#state.table = table;

    return this;
  }

  select(table: SqlStatement | undefined) {
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

  returning(result?: SqlResultRecord | SqlResultColumn[]) {
    if (!this.#state.returning) {
      this.#state.returning = new SqlReturningClause(this, result);
    } else {
      this.#state.returning.reset(result);
    }

    return this;
  }

  build(): [string, unknown[]] {
    const { table, alias, references, record, source, returning } = this.#state;

    if (!table) {
      throw new MissingTableError();
    }

    const statement = [`INSERT INTO ${escapeSqlName(table)}`];
    const variables: unknown[] = [];

    if (alias) {
      statement.push(`AS ${escapeSqlName(alias)}`);
    }

    const hasRecord = record && !isEmptyObject(record);

    const allValues = getValueReferences(this.values, {
      variables,
      references
    });

    statement.push(hasRecord ? `(${getColumnsName(this.fields)})` : 'DEFAULT');

    if (source?.alias) {
      statement.push(`SELECT ${allValues} FROM ${escapeSqlName(source.alias)}`);
    } else {
      statement.push('VALUES');

      if (hasRecord) {
        statement.push(`(${allValues})`);
      }
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
  return columns.map((column) => escapeSqlName(column)).join(', ');
};

const getValueReferences = (values: unknown[], context: SqlInsertContext): string => {
  const { variables, references } = context;

  const referenceList = values.map((value) => {
    if (value instanceof SqlReference) {
      return value.build();
    }

    if (value instanceof SqlSelectStatement) {
      const [selectStatement, selectVariables] = value.build();

      variables.push(...selectVariables);

      return `(${selectStatement})`;
    }

    variables.push(value);

    return `:${references.counter++}`;
  });

  return referenceList.join(', ');
};
