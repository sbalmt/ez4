import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';
import type { SqlFilters } from './common.js';

import { ObjectSchema } from '@ez4/schema';

import { escapeSqlName } from '../utils/escape.js';
import { MissingJoinConditionError } from '../errors/queries.js';
import { SqlConditions } from './conditions.js';
import { SqlResults } from './results.js';
import { SqlSource } from './source.js';

export class SqlJoin extends SqlSource {
  #state: {
    on: SqlConditions;
    schema?: ObjectSchema;
    results?: SqlResults;
    table: string;
    alias?: string;
  };

  constructor(table: string, schema: ObjectSchema | undefined, references: SqlBuilderReferences, options: SqlBuilderOptions) {
    super();

    this.#state = {
      on: new SqlConditions(this, references, options),
      schema,
      table
    };
  }

  get filters() {
    return this.#state.on;
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

  as(alias: string | undefined) {
    this.#state.alias = alias;

    return this;
  }

  on(filters: SqlFilters) {
    this.#state.on.apply(filters);

    return this;
  }

  build(): [string, unknown[]] {
    const { table, alias, on } = this.#state;

    const clause = [`INNER JOIN ${escapeSqlName(table)}`];

    const onResult = on.build();

    if (!onResult) {
      throw new MissingJoinConditionError();
    }

    if (alias) {
      clause.push(`AS ${escapeSqlName(alias)}`);
    }

    const [onConditions, onVariables] = onResult;

    clause.push(`ON ${onConditions}`);

    return [clause.join(' '), onVariables];
  }
}
