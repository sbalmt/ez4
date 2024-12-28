import type { SqlJsonColumnOptions, SqlJsonColumnSchema } from '../types/json.js';
import type { SqlColumn } from '../types/common.js';
import type { SqlStatement } from './statement.js';

import { escapeName, mergeAlias } from '../utils.js';
import { MissingColumnAliasError } from '../errors/column.js';
import { SqlSelectStatement } from '../queries/select.js';
import { SqlJsonColumn } from '../types/json.js';

export type SqlResultColumn = SqlColumn | SqlSelectStatement;

export type SqlObjectColumn = Omit<SqlJsonColumnOptions, 'aggregate'>;

export type SqlArrayColumn = Omit<SqlJsonColumnOptions, 'aggregate'>;

type SqlResultsContext = {
  statement?: SqlStatement;
  variables: unknown[];
};

type SqlResultsState = {
  statement: SqlStatement;
  columns: (SqlResultColumn | SqlJsonColumn)[];
};

export class SqlResults {
  #state: SqlResultsState;

  constructor(statement: SqlStatement, columns: (SqlResultColumn | SqlJsonColumn)[]) {
    this.#state = {
      statement,
      columns
    };
  }

  get fields() {
    return [...this.#state.columns];
  }

  get empty() {
    return !this.#state.columns.length;
  }

  reset(...columns: SqlResultColumn[]) {
    this.#state.columns = columns;

    return this;
  }

  column(column: SqlResultColumn) {
    this.#state.columns.push(column);

    return this;
  }

  jsonColumn(schema: SqlJsonColumnSchema, options: SqlJsonColumnOptions) {
    this.#state.columns.push(
      new SqlJsonColumn(
        schema,
        this.#state.statement,
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
    const { statement, columns } = this.#state;

    const context = {
      variables: [],
      statement
    };

    return [getResultColumns(columns, context), context.variables];
  }
}

const getResultColumns = (
  columns: (SqlResultColumn | SqlJsonColumn)[],
  context: SqlResultsContext
) => {
  const { statement, variables } = context;

  const columnsList = columns.map((column): string => {
    if (column instanceof SqlJsonColumn) {
      return column.build();
    }

    if (column instanceof SqlSelectStatement) {
      const columnAlias = column.alias;

      if (!columnAlias) {
        throw new MissingColumnAliasError();
      }

      if (!column.filters) {
        column.as(undefined);
      } else {
        column.as(`T`);
      }

      const [selectStatement, selectVariables] = column.build();

      variables.push(...selectVariables);

      return `(${selectStatement}) AS ${escapeName(columnAlias)}`;
    }

    if (!(column instanceof Array)) {
      return mergeAlias(escapeName(column), statement?.alias);
    }

    const [columnName, columnAlias] = column.map((name) => {
      return escapeName(name);
    });

    if (columnName !== columnAlias) {
      return `${mergeAlias(columnName, statement?.alias)} AS ${columnAlias}`;
    }

    return mergeAlias(columnName, statement?.alias);
  });

  return columnsList.join(', ') || '*';
};
