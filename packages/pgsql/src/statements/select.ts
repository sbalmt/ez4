import type { Query } from '@ez4/database';
import type { SqlWhereFilters } from '../helpers/where.js';
import type { SqlJsonColumnSchema } from '../helpers/json.js';
import type { SqlBuilderReferences } from '../builder.js';
import type { SqlColumnName, SqlStatement } from '../types.js';

import { isAnyNumber, isEmptyObject } from '@ez4/utils';
import { Order } from '@ez4/database';

import { escapeName, escapeColumn } from '../utils.js';
import { InvalidColumnOrderError, MissingColumnAliasError } from '../errors/column.js';
import { MissingTableNameError } from '../errors/table.js';
import { SqlColumnReference } from '../helpers/reference.js';
import { SqlWhereClause } from '../helpers/where.js';
import { SqlJsonColumn } from '../helpers/json.js';

export type SqlSelectColumn = SqlColumnName | SqlSelectStatement;

export type SqlSelectOrder = Query.OrderInput<any>;

export type SqlJsonColumnOptions = {
  aggregate: boolean;
  alias?: string;
};

type SqlSelectState = {
  references: SqlBuilderReferences;
  columns: (SqlSelectColumn | SqlJsonColumn)[];
  ordering?: SqlSelectOrder;
  where?: SqlWhereClause;
  table?: string;
  alias?: string;
  skip?: number;
  take?: number;
};

export class SqlSelectStatement implements SqlStatement {
  #state: SqlSelectState;

  constructor(state: SqlSelectState) {
    this.#state = state;
  }

  get alias() {
    return this.#state.alias;
  }

  get fields() {
    return this.#state.columns ?? [];
  }

  get filters() {
    return this.#state.where;
  }

  columns(...columns: SqlSelectColumn[]) {
    this.#state.columns = columns;

    return this;
  }

  column(column: SqlSelectColumn) {
    this.#state.columns.push(column);

    return this;
  }

  jsonColumn(schema: SqlJsonColumnSchema, options: SqlJsonColumnOptions) {
    this.#state.columns.push(
      new SqlJsonColumn({
        aggregate: options.aggregate,
        column: options.alias,
        statement: this,
        schema
      })
    );

    return this;
  }

  objectColumn(schema: SqlJsonColumnSchema, alias?: string) {
    return this.jsonColumn(schema, {
      aggregate: false,
      alias
    });
  }

  arrayColumn(schema: SqlJsonColumnSchema, alias?: string) {
    return this.jsonColumn(schema, {
      aggregate: true,
      alias
    });
  }

  from(table: string | undefined) {
    this.#state.table = table;

    return this;
  }

  as(alias: string | undefined) {
    this.#state.alias = alias;

    return this;
  }

  where(filters?: SqlWhereFilters) {
    if (!this.#state.where || filters) {
      this.#state.where = new SqlWhereClause({
        references: this.#state.references,
        filters: filters ?? {},
        statement: this
      });
    }

    return this;
  }

  order(ordering: SqlSelectOrder | undefined) {
    this.#state.ordering = ordering;

    return this;
  }

  skip(amount: number | undefined) {
    this.#state.skip = amount;

    return this;
  }

  take(amount: number | undefined) {
    this.#state.take = amount;

    return this;
  }

  reference(column: string) {
    return new SqlColumnReference({
      statement: this,
      name: column
    });
  }

  build(): [string, unknown[]] {
    const { table, alias, where, ordering, skip, take } = this.#state;

    if (!table) {
      throw new MissingTableNameError();
    }

    const variables: unknown[] = [];
    const statement = [`SELECT ${getSelectColumns(this.fields, variables)}`];

    statement.push(`FROM ${escapeName(table)}`);

    if (alias) {
      statement.push(`AS ${escapeName(alias)}`);
    }

    if (where && !where.empty) {
      const [whereClause, whereVariables] = where.build();

      variables.push(...whereVariables);
      statement.push(whereClause);
    }

    if (ordering && !isEmptyObject(ordering)) {
      statement.push(`ORDER BY ${getOrderColumns(ordering)}`);
    }

    if (isAnyNumber(skip)) {
      statement.push(`OFFSET ${skip}`);
    }

    if (isAnyNumber(take)) {
      statement.push(`LIMIT ${take}`);
    }

    return [statement.join(' '), variables];
  }
}

const getSelectColumns = (columns: (SqlSelectColumn | SqlJsonColumn)[], variables: unknown[]) => {
  const columnsList = columns.map((column): string => {
    if (column instanceof SqlJsonColumn) {
      return column.toString();
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

    return escapeColumn(column);
  });

  return columnsList.join(', ') || '*';
};

const getOrderColumns = (ordering: Query.OrderInput<any>) => {
  const orderColumns = [];

  for (const column in ordering) {
    switch (ordering[column]) {
      case Order.Asc:
        orderColumns.push(`${escapeName(column)} ASC`);
        break;

      case Order.Desc:
        orderColumns.push(`${escapeName(column)} DESC`);
        break;

      default:
        throw new InvalidColumnOrderError(column);
    }
  }

  return orderColumns.join(', ');
};
