import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';
import type { SqlResultColumn, SqlResultRecord } from '../types/results.js';
import type { SqlSourceWithResults } from '../types/source.js';
import type { SqlRecord } from '../types/common.js';
import type { ObjectSchema } from '@ez4/schema';

import { SqlRawValue } from '../types/raw.js';
import { SqlSource } from '../types/source.js';
import { SqlReference } from '../types/reference.js';
import { SqlReturningClause } from '../types/returning.js';
import { MissingTableNameError } from '../errors/queries.js';
import { getFields, getValues } from '../utils/column.js';
import { escapeSqlName } from '../utils/escape.js';
import { SqlSelectStatement } from './select.js';
import { getTableNames } from '../utils/table.js';

type SqlInsertContext = {
  options: SqlBuilderOptions;
  references: SqlBuilderReferences;
  variables: unknown[];
};

export class SqlInsertStatement extends SqlSource {
  #state: {
    options: SqlBuilderOptions;
    references: SqlBuilderReferences;
    returning?: SqlReturningClause;
    schema?: ObjectSchema;
    record?: SqlRecord;
    sources?: SqlSource[];
    table?: string;
    alias?: string;
  };

  constructor(schema: ObjectSchema | undefined, references: SqlBuilderReferences, options: SqlBuilderOptions) {
    super();

    this.#state = {
      options,
      references,
      schema
    };
  }

  get fields() {
    return this.#state.record ? getFields(this.#state.record) : [];
  }

  get values() {
    return this.#state.record ? getValues(this.#state.record) : [];
  }

  get alias() {
    return this.#state.alias;
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

  select(...tables: SqlSource[]) {
    this.#state.sources = tables;

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
    const { returning } = this.#state;

    if (!returning) {
      this.#state.returning = new SqlReturningClause(this, result);
    } else if (result) {
      returning.apply(result);
    }

    return this as SqlInsertStatement & SqlSourceWithResults;
  }

  build(): [string, unknown[]] {
    const { table, alias, references, options, record, schema, sources, returning } = this.#state;

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

    const values = getValueReferences(this, record ?? {}, schema, {
      variables,
      references,
      options
    });

    if (sources?.length) {
      statement.push(`SELECT ${values} FROM ${getTableNames(sources).join(', ')}`);
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

const getValueReferences = (source: SqlSource, record: SqlRecord, schema: ObjectSchema | undefined, context: SqlInsertContext): string => {
  const { variables, references, options } = context;

  const results = [];

  for (const field in record) {
    const value = record[field];

    if (value === undefined) {
      continue;
    }

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

    const fieldValue = value instanceof SqlRawValue ? value.build(source) : value;
    const fieldIndex = references.counter++;

    results.push(`:${fieldIndex}`);

    if (options.onPrepareVariable) {
      const preparedValue = options.onPrepareVariable(fieldValue, {
        index: fieldIndex,
        schema: schema?.properties[field],
        json: false
      });

      variables.push(preparedValue);
      continue;
    }

    variables.push(fieldValue);
  }

  return results.join(', ');
};
