import type { SqlJsonColumnOptions, SqlJsonColumnSchema } from '../types/json.js';
import type { SqlColumn } from '../types/common.js';
import type { SqlRawGenerator } from './raw.js';
import type { SqlSource } from './source.js';

import { isAnyObject } from '@ez4/utils';

import { MissingColumnAliasError } from '../errors/queries.js';
import { SqlSelectStatement } from '../queries/select.js';
import { escapeSqlName } from '../utils/escape.js';
import { mergeSqlAlias } from '../utils/merge.js';
import { SqlJsonColumn } from '../types/json.js';
import { SqlReference } from './reference.js';
import { SqlRaw } from './raw.js';

export type SqlObjectColumn = Omit<SqlJsonColumnOptions, 'aggregate'>;

export type SqlArrayColumn = Omit<SqlJsonColumnOptions, 'aggregate'>;

export type SqlResultColumn = SqlColumn | SqlRaw | SqlReference | SqlSelectStatement;

export type SqlResultRecord = {
  [column: string]:
    | undefined
    | string
    | boolean
    | SqlRaw
    | SqlReference
    | SqlSelectStatement
    | SqlJsonColumnSchema;
};

type SqlResultsContext = {
  source?: SqlSource;
  variables: unknown[];
};

export class SqlResults {
  #state: {
    source: SqlSource;
    columns: (SqlResultColumn | SqlJsonColumn)[];
  };

  constructor(source: SqlSource, columns?: SqlResultRecord | SqlResultColumn[]) {
    this.#state = {
      source,
      columns: Array.isArray(columns) ? columns : columns ? getRecordColumns(columns, source) : []
    };
  }

  get fields() {
    return [...this.#state.columns];
  }

  get empty() {
    return !this.#state.columns.length;
  }

  has(column: SqlResultColumn) {
    return this.#state.columns.includes(column);
  }

  reset(result?: SqlResultRecord | SqlResultColumn[]) {
    if (Array.isArray(result)) {
      this.#state.columns = result;
    } else if (result) {
      this.#state.columns = getRecordColumns(result, this.#state.source);
    } else {
      this.#state.columns = [];
    }

    return this;
  }

  column(column: SqlResultColumn) {
    this.#state.columns.push(column);

    return this;
  }

  record(record: SqlResultRecord) {
    this.#state.columns = getRecordColumns(record, this.#state.source);

    return this;
  }

  rawColumn(column: number | string | SqlRawGenerator) {
    this.#state.columns.push(new SqlRaw(this.#state.source, column));

    return this;
  }

  jsonColumn(schema: SqlJsonColumnSchema, options: SqlJsonColumnOptions) {
    this.#state.columns.push(
      new SqlJsonColumn(
        schema,
        this.#state.source,
        options.aggregate,
        options.column,
        options.alias
      )
    );

    return this;
  }

  objectColumn(schema: SqlJsonColumnSchema, options?: SqlObjectColumn) {
    return this.jsonColumn(schema, {
      ...options,
      aggregate: false
    });
  }

  arrayColumn(schema: SqlJsonColumnSchema, options?: SqlArrayColumn) {
    return this.jsonColumn(schema, {
      ...options,
      aggregate: true
    });
  }

  build(): [string, unknown[]] {
    const { source, columns } = this.#state;

    const context = {
      variables: [],
      source
    };

    return [getResultColumns(columns, context), context.variables];
  }
}

const getRecordColumns = (record: SqlResultRecord, source: SqlSource) => {
  const columns: (SqlResultColumn | SqlJsonColumn)[] = [];

  for (const column in record) {
    const value = record[column];

    if (value === true) {
      columns.push(column);
    } else if (typeof value === 'string') {
      columns.push([column, value]);
    } else if (value instanceof SqlRaw || value instanceof SqlReference) {
      columns.push(value);
    } else if (value instanceof SqlSelectStatement) {
      columns.push(value.as(column));
    } else if (isAnyObject(value)) {
      columns.push(new SqlJsonColumn(value, source, false, column));
    }
  }

  return columns;
};

const getResultColumns = (
  columns: (SqlResultColumn | SqlJsonColumn)[],
  context: SqlResultsContext
) => {
  const { source, variables } = context;

  const columnsList = columns.map((column) => {
    if (column instanceof SqlRaw) {
      return column.build();
    }

    if (column instanceof SqlReference) {
      return column.build();
    }

    if (column instanceof SqlJsonColumn) {
      const [jsonResult, jsonVariables] = column.build();

      variables.push(...jsonVariables);

      return jsonResult;
    }

    if (column instanceof SqlSelectStatement) {
      const columnAlias = column.alias;

      if (!columnAlias) {
        throw new MissingColumnAliasError();
      }

      const [selectStatement, selectVariables] = column
        .as(column.filters ? `T` : undefined)
        .build();

      variables.push(...selectVariables);

      return `(${selectStatement}) AS ${escapeSqlName(columnAlias)}`;
    }

    if (!(column instanceof Array)) {
      return mergeSqlAlias(escapeSqlName(column), source?.alias);
    }

    const [columnName, columnAlias] = column.map((name) => {
      return escapeSqlName(name);
    });

    if (columnName !== columnAlias) {
      return `${mergeSqlAlias(columnName, source?.alias)} AS ${columnAlias}`;
    }

    return mergeSqlAlias(columnName, source?.alias);
  });

  return columnsList.join(', ') || '*';
};
