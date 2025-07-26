import type { ObjectSchema } from '@ez4/schema';
import type { SqlArrayColumn, SqlObjectColumn, SqlResultColumn, SqlResultRecord } from '../common/results.js';
import type { SqlJsonColumnOptions, SqlJsonColumnSchema } from '../common/json.js';
import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';
import type { SqlTableReference } from '../common/reference.js';
import type { SqlSourceWithResults } from '../common/source.js';
import type { SqlFilters, SqlOrder } from '../common/types.js';
import type { SqlRawGenerator } from '../common/raw.js';

import { isAnyNumber } from '@ez4/utils';

import { escapeSqlName } from '../utils/escape.js';
import { getTableExpressions } from '../utils/table.js';
import { MissingTableNameError, NoColumnsError } from '../errors/queries.js';
import { SqlWhereClause } from '../clauses/where.js';
import { SqlOrderClause } from '../clauses/order.js';
import { SqlResults } from '../common/results.js';
import { SqlSource } from '../common/source.js';
import { SqlJoin } from '../clauses/join.js';

export class SqlSelectStatement extends SqlSource implements SqlSourceWithResults {
  #state: {
    options: SqlBuilderOptions;
    references: SqlBuilderReferences;
    schema?: ObjectSchema;
    results: SqlResults;
    joins: SqlJoin[];
    where?: SqlWhereClause;
    order?: SqlOrderClause;
    tables?: (string | SqlTableReference | SqlSource)[];
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

  from(...tables: (string | SqlTableReference | SqlSource)[]) {
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

  order(columns: SqlOrder | undefined) {
    const { order } = this.#state;

    if (!order) {
      this.#state.order = new SqlOrderClause(this, columns);
    } else if (columns) {
      order.apply(columns);
    }

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
    const { tables, alias, results, joins, where, order, skip, take } = this.#state;

    if (!tables?.length) {
      throw new MissingTableNameError();
    }

    const [columns, variables] = results.build();

    if (!columns.length) {
      throw new NoColumnsError();
    }

    const [tableExpressions, tableVariables] = getTableExpressions(tables);

    const statement = [`SELECT ${columns} FROM ${tableExpressions.join(', ')}`];

    variables.push(...tableVariables);

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

    if (order && !order.empty) {
      statement.push(order.build());
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
