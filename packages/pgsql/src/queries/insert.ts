import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';
import type { SqlResultColumn, SqlResultRecord } from '../types/results.js';
import type { SqlStatementWithResults } from '../types/statement.js';
import type { SqlRecord } from '../types/common.js';
import type { ObjectSchema } from '@ez4/schema';

import { SqlRaw } from '../types/raw.js';
import { SqlReference } from '../types/reference.js';
import { SqlStatement } from '../types/statement.js';
import { SqlReturningClause } from '../types/returning.js';
import { MissingTableNameError } from '../errors/queries.js';
import { escapeSqlName } from '../utils/escape.js';
import { SqlSelectStatement } from './select.js';

type SqlInsertContext = {
  options: SqlBuilderOptions;
  references: SqlBuilderReferences;
  variables: unknown[];
};

export class SqlInsertStatement extends SqlStatement {
  #state: {
    options: SqlBuilderOptions;
    references: SqlBuilderReferences;
    returning?: SqlReturningClause;
    schema?: ObjectSchema;
    record?: SqlRecord;
    source?: SqlStatement;
    table?: string;
    alias?: string;
  };

  constructor(
    schema: ObjectSchema | undefined,
    references: SqlBuilderReferences,
    options: SqlBuilderOptions
  ) {
    super();

    this.#state = {
      options,
      references,
      schema
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

  get schema() {
    return this.#state.schema;
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

  returning(
    result?: SqlResultRecord | SqlResultColumn[]
  ): SqlInsertStatement & SqlStatementWithResults {
    const { returning } = this.#state;

    if (!returning) {
      this.#state.returning = new SqlReturningClause(this, result);
    } else {
      returning.apply(result);
    }

    return this as any;
  }

  build(): [string, unknown[]] {
    const { table, alias, references, options, record, schema, source, returning } = this.#state;

    if (!table) {
      throw new MissingTableNameError();
    }

    const statement = [`INSERT INTO ${escapeSqlName(table)}`];
    const variables: unknown[] = [];

    if (alias) {
      statement.push(`AS ${escapeSqlName(alias)}`);
    }

    const columns = getColumnsName(this.fields);

    statement.push(columns.length ? `(${columns})` : 'DEFAULT');

    const values = getValueReferences(record ?? {}, schema, {
      variables,
      references,
      options
    });

    if (source?.alias) {
      statement.push(`SELECT ${values} FROM ${escapeSqlName(source.alias)}`);
    } else {
      statement.push('VALUES');

      if (values.length) {
        statement.push(`(${values})`);
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

const getValueReferences = (
  record: SqlRecord,
  schema: ObjectSchema | undefined,
  context: SqlInsertContext
): string => {
  const { variables, references, options } = context;

  const results = [];

  for (const field in record) {
    const value = record[field];

    if (value instanceof SqlReference) {
      results.push(value.build());
      continue;
    }

    if (value instanceof SqlSelectStatement) {
      const [selectStatement, selectVariables] = value.build();

      variables.push(...selectVariables);
      results.push(`(${selectStatement})`);

      continue;
    }

    const fieldValue = value instanceof SqlRaw ? value.build() : value;
    const fieldIndex = references.counter++;

    if (options.onPrepareVariable) {
      variables.push(options.onPrepareVariable(fieldValue, fieldIndex, schema?.properties[field]));
    } else {
      variables.push(fieldValue);
    }

    results.push(`:${fieldIndex}`);
  }

  return results.join(', ');
};
