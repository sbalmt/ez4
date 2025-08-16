import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';
import type { SqlResultColumn, SqlResultRecord } from '../common/results.js';
import type { SqlSourceWithResults } from '../common/source.js';
import type { SqlTableReference } from '../common/reference.js';
import type { SqlRecord } from '../common/types.js';
import type { ObjectSchema } from '@ez4/schema';

import { getFields, getValues } from '../utils/column.js';
import { escapeSqlName, escapeSqlNames } from '../utils/escape.js';
import { SqlReturningClause } from '../clauses/query/returning.js';
import { SqlConflictClause } from '../clauses/query/conflict.js';
import { SqlColumnReference } from '../common/reference.js';
import { getSelectExpressions } from '../helpers/select.js';
import { SqlRawValue } from '../common/raw.js';
import { SqlSource } from '../common/source.js';
import { MissingTableNameError } from './errors.js';
import { SqlSelectStatement } from './select.js';

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
    conflict?: SqlConflictClause;
    sources?: (SqlTableReference | SqlSource)[];
    schema?: ObjectSchema;
    record?: SqlRecord;
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

  select(...tables: (SqlTableReference | SqlSource)[]) {
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

  conflict(columns: string[], record?: SqlRecord) {
    const { conflict, schema, references, options } = this.#state;

    if (!conflict) {
      this.#state.conflict = new SqlConflictClause(this, schema, references, options, columns, record);
    } else if (record) {
      conflict.apply(record);
    }

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
    const { table, alias, references, options, record, schema, sources, returning, conflict } = this.#state;

    if (!table) {
      throw new MissingTableNameError();
    }

    const statement = [`INSERT INTO ${escapeSqlName(table)}`];
    const variables: unknown[] = [];

    if (alias) {
      statement.push(`AS ${escapeSqlName(alias)}`);
    }

    const columns = escapeSqlNames(this.fields);

    statement.push(columns.length ? `(${columns})` : 'DEFAULT');

    const values = getValueReferences(this, record ?? {}, schema, {
      variables,
      references,
      options
    });

    if (sources?.length) {
      const [tableExpressions, tableVariables] = getSelectExpressions(sources);

      statement.push(`SELECT ${values} FROM ${tableExpressions.join(', ')}`);
      variables.push(...tableVariables);
    } else {
      statement.push('VALUES');

      if (values.length) {
        statement.push(`(${values})`);
      }
    }

    if (conflict && !conflict.empty) {
      const [conflictClause, conflictVariables] = conflict.build();

      variables.push(...conflictVariables);
      statement.push(conflictClause);
    }

    if (returning && !returning.empty) {
      const [returningClause, returningVariables] = returning.build();

      variables.push(...returningVariables);
      statement.push(returningClause);
    }

    return [statement.join(' '), variables];
  }
}

const getValueReferences = (source: SqlSource, record: SqlRecord, schema: ObjectSchema | undefined, context: SqlInsertContext): string => {
  const { variables, references, options } = context;

  const results = [];

  for (const fieldName in record) {
    const value = record[fieldName];

    if (value === undefined) {
      continue;
    }

    if (value === null) {
      results.push('null');
      continue;
    }

    if (value instanceof SqlColumnReference) {
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

    if (!options.onPrepareVariable) {
      variables.push(fieldValue);
      continue;
    }

    const fieldSchema = schema?.properties[fieldName];

    const preparedValue = options.onPrepareVariable(fieldValue, {
      schema: fieldSchema,
      index: fieldIndex,
      json: false
    });

    variables.push(preparedValue);
  }

  return results.join(', ');
};
