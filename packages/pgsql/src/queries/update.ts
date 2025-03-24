import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';
import type { SqlResultColumn, SqlResultRecord } from '../types/results.js';
import type { SqlSourceWithResults } from '../types/source.js';
import type { SqlFilters, SqlRecord } from '../types/common.js';
import { isObjectSchema, type ObjectSchema } from '@ez4/schema';

import { isPlainObject } from '@ez4/utils';

import { MissingTableNameError, MissingRecordError, EmptyRecordError } from '../errors/queries.js';
import { SqlRaw, SqlRawOperation } from '../types/raw.js';
import { SqlReference } from '../types/reference.js';
import { SqlReturningClause } from '../types/returning.js';
import { SqlWhereClause } from '../types/where.js';
import { SqlSource } from '../types/source.js';
import { escapeSqlName } from '../utils/escape.js';
import { getFields, getValues } from '../utils/column.js';
import { mergeSqlPath } from '../utils/merge.js';
import { SqlSelectStatement } from './select.js';

type SqlUpdateContext = {
  options: SqlBuilderOptions;
  references: SqlBuilderReferences;
  variables: unknown[];
  parent?: string;
};

export class SqlUpdateStatement extends SqlSource {
  #state: {
    options: SqlBuilderOptions;
    references: SqlBuilderReferences;
    returning?: SqlReturningClause;
    schema?: ObjectSchema;
    record?: SqlRecord;
    source?: SqlSource;
    where?: SqlWhereClause;
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

  get filters() {
    return this.#state.where;
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

  only(table: string) {
    this.#state.table = table;

    return this;
  }

  from(table: SqlSource | undefined) {
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
    const { where, references, options } = this.#state;

    if (!where) {
      this.#state.where = new SqlWhereClause(this, references, options, filters);
    } else if (filters) {
      where.apply(filters);
    }

    return this;
  }

  returning(result?: SqlResultRecord | SqlResultColumn[]): SqlUpdateStatement & SqlSourceWithResults {
    const { returning } = this.#state;

    if (!returning) {
      this.#state.returning = new SqlReturningClause(this, result);
    } else if (result) {
      returning.apply(result);
    }

    return this as any;
  }

  build(): [string, unknown[]] {
    const { table, alias, references, options, record, schema, source, where, returning } = this.#state;

    if (!table) {
      throw new MissingTableNameError();
    }

    const statement = [`UPDATE ONLY ${escapeSqlName(table)}`];
    const variables: unknown[] = [];

    if (alias) {
      statement.push(`AS ${escapeSqlName(alias)}`);
    }

    if (!record) {
      throw new MissingRecordError();
    }

    const columns = getUpdateColumns(this, record, schema, {
      variables,
      references,
      options
    });

    if (!columns.length) {
      throw new EmptyRecordError();
    }

    statement.push(`SET ${columns.join(', ')}`);

    if (source?.alias) {
      statement.push(`FROM ${escapeSqlName(source.alias)}`);
    }

    if (where && !where.empty) {
      const whereResult = where.build();

      if (whereResult) {
        const [whereClause, whereVariables] = whereResult;

        statement.push(whereClause);
        variables.push(...whereVariables);
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

const getUpdateColumns = (source: SqlSource, record: SqlRecord, schema: ObjectSchema | undefined, context: SqlUpdateContext): string[] => {
  const { variables, references, options, parent } = context;

  const columns = [];

  for (const field in record) {
    const value = record[field];

    if (value === undefined) {
      continue;
    }

    const columnName = mergeSqlPath(field, parent);

    if (value instanceof SqlReference) {
      columns.push(`${columnName} = ${value.build()}`);
      continue;
    }

    if (value instanceof SqlSelectStatement) {
      const [selectStatement, selectVariables] = value.build();

      columns.push(`${columnName} = (${selectStatement})`);
      variables.push(...selectVariables);

      continue;
    }

    const valueSchema = schema?.properties[field];

    if (isPlainObject(value)) {
      const nextSchema = valueSchema && isObjectSchema(valueSchema) ? valueSchema : undefined;

      const jsonValue = getUpdateColumns(source, value, nextSchema, {
        ...context,
        parent: columnName
      });

      columns.push(...jsonValue);
      continue;
    }

    const fieldValue = value instanceof SqlRaw ? value.build(source) : value;
    const fieldIndex = references.counter++;

    const json = !!parent;

    if (value instanceof SqlRawOperation) {
      if (json) {
        columns.push(`${columnName} = (${columnName}::int ${value.operator} :${fieldIndex})::text::jsonb`);
      } else {
        columns.push(`${columnName} = (${columnName} ${value.operator} :${fieldIndex})`);
      }
    } else {
      columns.push(`${columnName} = :${fieldIndex}`);
    }

    if (options.onPrepareVariable) {
      const preparedValue = options.onPrepareVariable(fieldValue, {
        index: fieldIndex,
        schema: valueSchema,
        json
      });

      variables.push(preparedValue);
      continue;
    }

    variables.push(fieldValue);
  }

  return columns;
};
