import type { ObjectSchema } from '@ez4/schema';
import type { SqlBuilderOptions, SqlBuilderReferences } from '../../builder';
import type { SqlResults } from '../../common/results';
import type { SqlFilters } from '../../common/types';

import { SqlSource } from '../../common/source';
import { SqlConditions } from '../../operations/conditions';
import { escapeSqlName } from '../../utils/escape';
import { MissingJoinConditionError } from '../errors';

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
    const result = on.build();

    if (!result) {
      throw new MissingJoinConditionError();
    }

    if (alias) {
      clause.push(`AS ${escapeSqlName(alias)}`);
    }

    const [onConditions, onVariables] = result;

    clause.push(`ON ${onConditions}`);

    return [clause.join(' '), onVariables];
  }
}
