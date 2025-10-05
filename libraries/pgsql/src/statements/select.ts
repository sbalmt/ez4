import type { ObjectSchema } from '@ez4/schema';
import type { SqlTableReference } from '../common/reference';
import type { SqlJsonColumnOptions, SqlJsonColumnRecord } from '../common/json';
import type { SqlArrayColumn, SqlObjectColumn, SqlResultColumn, SqlResultRecord } from '../common/results';
import type { SqlRawGenerator, SqlRawValue } from '../common/raw';
import type { SqlSourceWithResults } from '../common/source';
import type { SqlFilters, SqlOrder } from '../common/types';
import type { SqlUnionClause } from '../clauses/query/union';
import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder';

import { isAnyNumber } from '@ez4/utils';

import { SqlSource } from '../common/source';
import { SqlResults } from '../common/results';
import { escapeSqlName } from '../utils/escape';
import { getSelectExpressions } from '../helpers/select';
import { SqlWhereClause } from '../clauses/query/where';
import { SqlOrderClause } from '../clauses/query/order';
import { SqlJoin } from '../clauses/query/join';
import { NoColumnsError } from './errors';

export class SqlSelectStatement extends SqlSource implements SqlSourceWithResults {
  #state: {
    options: SqlBuilderOptions;
    references: SqlBuilderReferences;
    tables?: (string | SqlRawValue | SqlTableReference | SqlUnionClause | SqlSource)[];
    where?: SqlWhereClause;
    order?: SqlOrderClause;
    schema?: ObjectSchema;
    results: SqlResults;
    building: boolean;
    joins: SqlJoin[];
    alias?: string;
    skip?: number;
    take?: number;
    lock: boolean;
  };

  constructor(schema: ObjectSchema | undefined, references: SqlBuilderReferences, options: SqlBuilderOptions) {
    super();

    this.#state = {
      results: new SqlResults(this, references),
      building: false,
      lock: false,
      joins: [],
      schema,
      references,
      options
    };
  }

  get fields() {
    return this.#state.results.fields;
  }

  get concurrent() {
    return this.#state.lock;
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

  get building() {
    return this.#state.building;
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

  jsonColumn(record: SqlJsonColumnRecord, options: SqlJsonColumnOptions) {
    this.#state.results.jsonColumn(record, options);
    return this;
  }

  objectColumn(record: SqlJsonColumnRecord, options?: SqlObjectColumn) {
    this.#state.results.objectColumn(record, options);
    return this;
  }

  arrayColumn(record: SqlJsonColumnRecord, options?: SqlArrayColumn) {
    this.#state.results.arrayColumn(record, options);
    return this;
  }

  from(...tables: (string | SqlRawValue | SqlTableReference | SqlUnionClause | SqlSource)[]) {
    this.#state.tables = tables;
    return this;
  }

  as(alias: string | undefined) {
    this.#state.alias = alias;
    return this;
  }

  join(table: string | SqlTableReference, schema?: ObjectSchema) {
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

  lock(lock = true) {
    this.#state.lock = lock;
    return this;
  }

  build(): [string, unknown[]] {
    const { tables, references, alias, results, joins, where, order, skip, take, lock } = this.#state;

    const [columns, variables] = results.build();

    if (!columns.length) {
      throw new NoColumnsError();
    }

    try {
      this.#state.building = true;

      const statement = ['SELECT', columns];

      if (tables?.length) {
        const [tableExpressions, tableVariables] = getSelectExpressions(tables, references);

        statement.push('FROM', tableExpressions.join(', '));
        variables.push(...tableVariables);
      }

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

      if (lock) {
        statement.push('FOR UPDATE');
      }

      return [statement.join(' '), variables];
    } finally {
      this.#state.building = false;
    }
  }
}
