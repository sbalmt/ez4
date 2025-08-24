import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';
import type { SqlResultColumn, SqlResultRecord } from '../common/results.js';
import type { SqlSourceWithResults } from '../common/source.js';
import type { SqlFilters } from '../common/types.js';
import type { ObjectSchema } from '@ez4/schema';

import { SqlSource } from '../common/source.js';
import { SqlReturningClause } from '../clauses/query/returning.js';
import { SqlWhereClause } from '../clauses/query/where.js';
import { escapeSqlName } from '../utils/escape.js';
import { MissingTableNameError } from './errors.js';

export class SqlDeleteStatement extends SqlSource {
  #state: {
    options: SqlBuilderOptions;
    references: SqlBuilderReferences;
    returning?: SqlReturningClause;
    schema?: ObjectSchema;
    where?: SqlWhereClause;
    table?: string;
    alias?: string;
  };

  constructor(schema: ObjectSchema | undefined, references: SqlBuilderReferences, options: SqlBuilderOptions) {
    super();

    this.#state = {
      options,
      references,
      schema
    };
  }

  get filters() {
    return this.#state.where;
  }

  get alias() {
    return this.#state.alias;
  }

  get results() {
    return this.#state.returning?.results;
  }

  get schema() {
    return this.#state.schema;
  }

  from(table: string) {
    this.#state.table = table;
    return this;
  }

  as(alias: string | undefined) {
    this.#state.alias = alias;
    return this;
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

  returning(result?: SqlResultRecord | SqlResultColumn[]) {
    const { references, returning } = this.#state;

    if (!returning) {
      this.#state.returning = new SqlReturningClause(this, references, result);
    } else if (result) {
      returning.apply(result);
    }

    return this as SqlDeleteStatement & SqlSourceWithResults;
  }

  build(): [string, unknown[]] {
    const { table, alias, where, returning } = this.#state;

    if (!table) {
      throw new MissingTableNameError();
    }

    const statement = [`DELETE FROM ${escapeSqlName(table)}`];
    const variables = [];

    if (alias) {
      statement.push(`AS ${escapeSqlName(alias)}`);
    }

    if (where && !where.empty) {
      const whereResult = where.build();

      if (whereResult) {
        const [whereClause, whereVariables] = whereResult;

        variables.push(...whereVariables);
        statement.push(whereClause);
      }
    }

    if (returning && !returning.empty) {
      const [returningClause, returningVariables] = returning.build();

      variables.push(...returningVariables);
      statement.push(returningClause);
    }

    return [statement.join(' '), variables];
  }
}
