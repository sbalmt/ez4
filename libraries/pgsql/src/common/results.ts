import type { SqlJsonColumnOptions, SqlJsonColumnRecord } from './json';
import type { SqlBuilderReferences } from '../builder';
import type { SqlRawGenerator } from './raw';
import type { SqlSource } from './source';
import type { SqlColumn } from './types';

import { isAnyObject } from '@ez4/utils';

import { mergeSqlAlias } from '../utils/merge';
import { escapeSqlName } from '../utils/escape';
import { getUniqueAlias } from '../helpers/alias';
import { SqlSelectStatement } from '../statements/select';
import { MissingColumnAliasError } from './errors';
import { SqlColumnReference } from './reference';
import { SqlJsonColumn } from './json';
import { SqlRawValue } from './raw';

export type SqlObjectColumn = Omit<SqlJsonColumnOptions, 'aggregate' | 'order'>;

export type SqlArrayColumn = Omit<SqlJsonColumnOptions, 'aggregate'>;

export type SqlResultColumn = SqlColumn | SqlRawValue | SqlColumnReference | SqlSelectStatement;

export type SqlResultRecord = {
  [column: string]: undefined | string | boolean | SqlRawValue | SqlColumnReference | SqlSelectStatement | SqlJsonColumnRecord;
};

type SqlResultsContext = {
  source?: SqlSource;
  references: SqlBuilderReferences;
  variables: unknown[];
};

export class SqlResults {
  #state: {
    columns: (SqlResultColumn | SqlJsonColumn)[];
    references: SqlBuilderReferences;
    source: SqlSource;
  };

  constructor(source: SqlSource, references: SqlBuilderReferences, columns?: SqlResultRecord | SqlResultColumn[]) {
    this.#state = {
      columns: Array.isArray(columns) ? columns : columns ? getRecordColumns(columns, source, references) : [],
      references,
      source
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
      this.#state.columns = getRecordColumns(result, this.#state.source, this.#state.references);
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
    this.#state.columns = getRecordColumns(record, this.#state.source, this.#state.references);
    return this;
  }

  rawColumn(column: number | string | SqlRawGenerator) {
    this.#state.columns.push(new SqlRawValue(column));
    return this;
  }

  jsonColumn(record: SqlJsonColumnRecord, options: SqlJsonColumnOptions) {
    this.#state.columns.push(new SqlJsonColumn(record, this.#state.source, this.#state.references, options));
    return this;
  }

  objectColumn(record: SqlJsonColumnRecord, options?: SqlObjectColumn) {
    return this.jsonColumn(record, {
      ...options,
      aggregate: false
    });
  }

  arrayColumn(record: SqlJsonColumnRecord, options?: SqlArrayColumn) {
    return this.jsonColumn(record, {
      ...options,
      aggregate: true
    });
  }

  build(): [string, unknown[]] {
    const { source, references, columns } = this.#state;

    const context = {
      variables: [],
      references,
      source
    };

    return [getResultColumns(columns, context), context.variables];
  }
}

const getRecordColumns = (record: SqlResultRecord, source: SqlSource, references: SqlBuilderReferences) => {
  const columns: (SqlResultColumn | SqlJsonColumn)[] = [];

  for (const column in record) {
    const value = record[column];

    if (value === true) {
      columns.push(column);
    } else if (typeof value === 'string') {
      columns.push([column, value]);
    } else if (value instanceof SqlRawValue || value instanceof SqlColumnReference) {
      columns.push(value);
    } else if (value instanceof SqlSelectStatement) {
      columns.push(value.as(column));
    } else if (isAnyObject(value)) {
      columns.push(new SqlJsonColumn(value, source, references, { aggregate: false, column }));
    }
  }

  return columns;
};

const getResultColumns = (columns: (SqlResultColumn | SqlJsonColumn)[], context: SqlResultsContext) => {
  const { source, references, variables } = context;

  const columnsList = columns.map((column) => {
    if (column instanceof SqlRawValue) {
      return column.build(source);
    }

    if (column instanceof SqlColumnReference) {
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

      const shouldUseAlias = column.filters && !column.filters.empty;
      const temporaryAlias = shouldUseAlias ? getUniqueAlias('S', references) : undefined;

      const [selectStatement, selectVariables] = column.as(temporaryAlias).build();

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
