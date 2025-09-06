import type { ObjectSchema } from '@ez4/schema';
import type { SqlResultColumn, SqlResultRecord } from '../common/results';
import type { SqlFilters, SqlRecord } from '../common/types';
import type { SqlSourceWithResults } from '../common/source';
import type { SqlTableReference } from '../common/reference';
import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder';

import { getUpdateColumns } from '../helpers/update';
import { getSelectExpressions } from '../helpers/select';
import { SqlReturningClause } from '../clauses/query/returning';
import { SqlWhereClause } from '../clauses/query/where';
import { getFields, getValues } from '../utils/column';
import { escapeSqlName } from '../utils/escape';
import { SqlSource } from '../common/source';
import { MissingTableNameError, MissingRecordError, EmptyRecordError } from './errors';

export class SqlUpdateStatement extends SqlSource {
  #state: {
    options: SqlBuilderOptions;
    references: SqlBuilderReferences;
    returning?: SqlReturningClause;
    source?: SqlTableReference | SqlSource;
    where?: SqlWhereClause;
    schema?: ObjectSchema;
    record?: SqlRecord;
    building: boolean;
    table?: string;
    alias?: string;
  };

  constructor(schema: ObjectSchema | undefined, references: SqlBuilderReferences, options: SqlBuilderOptions) {
    super();

    this.#state = {
      building: false,
      references,
      options,
      schema
    };
  }

  get fields() {
    return this.#state.record ? getFields(this.#state.record) : [];
  }

  get values() {
    return this.#state.record ? getValues(this.#state.record) : [];
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

  get building() {
    return this.#state.building;
  }

  only(table: string) {
    this.#state.table = table;
    return this;
  }

  from(table: SqlTableReference | SqlSource | undefined) {
    this.#state.source = table;
    return this;
  }

  as(alias: string | undefined) {
    this.#state.alias = alias;
    return this;
  }

  record(record: SqlRecord) {
    this.#state.record = record;
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

    return this as SqlUpdateStatement & SqlSourceWithResults;
  }

  build(): [string, unknown[]] {
    const { table, alias, references, options, record, schema, source, where, returning } = this.#state;

    if (!table) {
      throw new MissingTableNameError();
    }

    try {
      this.#state.building = true;

      const statement = ['UPDATE', 'ONLY', escapeSqlName(table)];
      const variables: unknown[] = [];

      if (alias) {
        statement.push('AS', escapeSqlName(alias));
      }

      if (!record) {
        throw new MissingRecordError();
      }

      const columns = getUpdateColumns(this, record, schema, {
        variables,
        references,
        options
      });

      if (!columns.length) {
        throw new EmptyRecordError();
      }

      statement.push('SET', columns.join(', '));

      if (source) {
        const [tableExpressions, tableVariables] = getSelectExpressions([source], references);

        statement.push('FROM', `${tableExpressions[0]}`);
        variables.push(...tableVariables);
      }

      if (where && !where.empty) {
        const whereResult = where.build();

        if (whereResult) {
          const [whereClause, whereVariables] = whereResult;

          statement.push(whereClause);
          variables.push(...whereVariables);
        }
      }

      if (returning && !returning.empty) {
        const [returningClause, returningVariables] = returning.build();

        variables.push(...returningVariables);
        statement.push(returningClause);
      }

      return [statement.join(' '), variables];
    } finally {
      this.#state.building = false;
    }
  }
}
