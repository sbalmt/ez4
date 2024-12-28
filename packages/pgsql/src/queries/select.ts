import type { Query } from '@ez4/database';
import type { SqlJsonColumn, SqlJsonColumnOptions, SqlJsonColumnSchema } from '../types/json.js';
import type { SqlArrayColumn, SqlObjectColumn, SqlResultColumn } from '../types/results.js';
import type { SqlFilters, SqlOrder } from '../types/common.js';
import type { SqlBuilderReferences } from '../builder.js';

import { isAnyNumber, isEmptyObject } from '@ez4/utils';
import { Order } from '@ez4/database';

import { escapeName } from '../utils.js';
import { MissingTableError } from '../errors/table.js';
import { InvalidColumnOrderError } from '../errors/column.js';
import { SqlStatement } from '../types/statement.js';
import { SqlWhereClause } from '../types/where.js';
import { SqlResults } from '../types/results.js';

type SqlSelectState = {
  results: SqlResults;
  references: SqlBuilderReferences;
  ordering?: SqlOrder;
  where?: SqlWhereClause;
  table?: string;
  alias?: string;
  skip?: number;
  take?: number;
};

export class SqlSelectStatement extends SqlStatement {
  #state: SqlSelectState;

  constructor(columns: (SqlResultColumn | SqlJsonColumn)[], references: SqlBuilderReferences) {
    super();

    this.#state = {
      results: new SqlResults(this, columns),
      references
    };
  }

  get alias() {
    return this.#state.alias;
  }

  get fields() {
    return this.#state.results.fields;
  }

  get filters() {
    return this.#state.where;
  }

  get results() {
    return this.#state.results;
  }

  columns(...columns: SqlResultColumn[]) {
    this.#state.results.reset(...columns);

    return this;
  }

  column(column: SqlResultColumn) {
    this.#state.results.column(column);

    return this;
  }

  jsonColumn(schema: SqlJsonColumnSchema, options: SqlJsonColumnOptions) {
    this.#state.results.jsonColumn(schema, options);

    return this;
  }

  objectColumn(schema: SqlJsonColumnSchema, options?: SqlObjectColumn) {
    this.#state.results.objectColumn(schema, options);

    return this;
  }

  arrayColumn(schema: SqlJsonColumnSchema, options?: SqlArrayColumn) {
    this.#state.results.arrayColumn(schema, options);

    return this;
  }

  from(table: string | undefined) {
    this.#state.table = table;

    return this;
  }

  as(alias: string | undefined) {
    this.#state.alias = alias;

    return this;
  }

  where(filters?: SqlFilters) {
    if (!this.#state.where) {
      this.#state.where = new SqlWhereClause(this, this.#state.references, filters);
    } else if (filters) {
      this.#state.where.apply(filters);
    }

    return this;
  }

  order(ordering: SqlOrder | undefined) {
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

  build(): [string, unknown[]] {
    const { table, alias, results, where, ordering, skip, take } = this.#state;

    if (!table) {
      throw new MissingTableError();
    }

    const [resultColumns, variables] = results.build();

    const statement = [`SELECT ${resultColumns} FROM ${escapeName(table)}`];

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
