import type { ObjectSchema } from '@ez4/schema';
import type { Query } from '@ez4/database';
import type { SqlArrayColumn, SqlObjectColumn, SqlResultColumn, SqlResultRecord } from '../types/results.js';
import type { SqlJsonColumnOptions, SqlJsonColumnSchema } from '../types/json.js';
import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';
import type { SqlSourceWithResults } from '../types/source.js';
import type { SqlFilters, SqlOrder } from '../types/common.js';
import type { SqlRawGenerator } from '../types/raw.js';

import { isAnyNumber, isEmptyObject } from '@ez4/utils';
import { Order } from '@ez4/database';

import { MissingTableNameError, InvalidColumnOrderError, NoColumnsError } from '../errors/queries.js';
import { SqlSource } from '../types/source.js';
import { SqlWhereClause } from '../types/where.js';
import { SqlResults } from '../types/results.js';
import { SqlJoin } from '../types/join.js';
import { escapeSqlName } from '../utils/escape.js';
import { getTableNames } from '../utils/table.js';

export class SqlSelectStatement extends SqlSource implements SqlSourceWithResults {
  #state: {
    options: SqlBuilderOptions;
    references: SqlBuilderReferences;
    schema?: ObjectSchema;
    results: SqlResults;
    joins: SqlJoin[];
    where?: SqlWhereClause;
    ordering?: SqlOrder;
    tables?: (string | SqlSource)[];
    alias?: string;
    skip?: number;
    take?: number;
  };

  constructor(schema: ObjectSchema | undefined, references: SqlBuilderReferences, options: SqlBuilderOptions) {
    super();

    this.#state = {
      results: new SqlResults(this),
      joins: [],
      schema,
      references,
      options
    };
  }

  get fields() {
    return this.#state.results.fields;
  }

  get filters() {
    return this.#state.where;
  }

  get alias() {
    return this.#state.alias;
  }

  get results() {
    return this.#state.results;
  }

  get schema() {
    return this.#state.schema;
  }

  columns(...columns: SqlResultColumn[]) {
    this.#state.results.reset(columns);

    return this;
  }

  record(record: SqlResultRecord) {
    this.#state.results.reset(record);

    return this;
  }

  column(column: SqlResultColumn) {
    this.#state.results.column(column);

    return this;
  }

  rawColumn(column: number | string | SqlRawGenerator) {
    this.#state.results.rawColumn(column);

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

  from(...tables: (string | SqlSource)[]) {
    this.#state.tables = tables;

    return this;
  }

  as(alias: string | undefined) {
    this.#state.alias = alias;

    return this;
  }

  join(table: string, schema?: ObjectSchema) {
    const { references, options, joins } = this.#state;

    const join = new SqlJoin(table, schema, references, options);

    joins.push(join);

    return join;
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
    const { tables, alias, results, joins, where, ordering, skip, take } = this.#state;

    if (!tables?.length) {
      throw new MissingTableNameError();
    }

    const [columns, variables] = results.build();

    if (!columns.length) {
      throw new NoColumnsError();
    }

    const statement = [`SELECT ${columns} FROM ${getTableNames(tables).join(', ')}`];

    if (alias) {
      statement.push(`AS ${escapeSqlName(alias)}`);
    }

    for (const join of joins) {
      const [joinClause, joinVariables] = join.build();

      variables.push(...joinVariables);
      statement.push(joinClause);
    }

    if (where && !where.empty) {
      const whereResult = where.build();

      if (whereResult) {
        const [whereClause, whereVariables] = whereResult;

        variables.push(...whereVariables);
        statement.push(whereClause);
      }
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
        orderColumns.push(`${escapeSqlName(column)} ASC`);
        break;

      case Order.Desc:
        orderColumns.push(`${escapeSqlName(column)} DESC`);
        break;

      default:
        throw new InvalidColumnOrderError(column);
    }
  }

  return orderColumns.join(', ');
};
