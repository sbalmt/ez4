import type { Query } from '@ez4/database';
import type { SqlBuilderReferences, SqlColumnName } from '../types.js';
import type { SqlWhereFilters } from '../helpers/where.js';

import { isAnyNumber, isEmptyObject } from '@ez4/utils';
import { Order } from '@ez4/database';

import { escapeName, escapeColumn } from '../utils.js';
import { InvalidColumnOrderError, MissingColumnAliasError } from '../errors/column.js';
import { MissingTableNameError } from '../errors/table.js';
import { SqlWhereClause } from '../helpers/where.js';

export type SqlSelectColumn = SqlColumnName | SqlSelectStatement;

export type SqlSelectOrder = Query.OrderInput<any>;

export type SqlSelectState = {
  references: SqlBuilderReferences;
  columns?: SqlSelectColumn[];
  ordering?: SqlSelectOrder;
  where?: SqlWhereClause;
  table?: string;
  skip?: number;
  take?: number;
};

export class SqlSelectStatement {
  #state: SqlSelectState;

  constructor(state: SqlSelectState) {
    this.#state = state;
  }

  get alias() {
    return this.#state.references.alias;
  }

  get fields() {
    return this.#state.columns ?? [];
  }

  columns(...columns: SqlSelectColumn[]) {
    this.#state.columns = columns;

    return this;
  }

  from(table: string | undefined) {
    this.#state.table = table;

    return this;
  }

  as(alias: string | undefined) {
    this.#state.references.alias = alias;

    return this;
  }

  where(filters?: SqlWhereFilters) {
    if (!this.#state.where || filters) {
      this.#state.where = new SqlWhereClause({
        references: this.#state.references,
        filters: filters ?? {}
      });
    }

    return this.#state.where;
  }

  order(ordering: SqlSelectOrder) {
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

  toString() {
    const { table, references, where, ordering, skip, take } = this.#state;

    const statement = [`SELECT ${getSelectColumns(this.fields)}`];

    if (!table) {
      throw new MissingTableNameError();
    }

    statement.push(`FROM ${escapeName(table)}`);

    if (references.alias) {
      statement.push(`AS ${escapeName(references.alias)}`);
    }

    if (where) {
      statement.push(where.toString());
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

    return statement.join(' ');
  }
}

export const selectQuery = (...columns: SqlSelectColumn[]) => {
  return new SqlSelectStatement({
    references: { counter: 0 },
    columns
  });
};

const getSelectColumns = (columns: SqlSelectColumn[]) => {
  const columnsList = columns.map((column) => {
    if (column instanceof SqlSelectStatement) {
      const columnAlias = column.alias;

      if (!columnAlias) {
        throw new MissingColumnAliasError();
      }

      column.as(undefined);

      return `(${column}) AS ${escapeName(columnAlias)}`;
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
