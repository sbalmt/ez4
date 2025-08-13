import type { ObjectSchema } from '@ez4/schema';
import type { SqlSource } from '../common/source.js';
import type { SqlRecord } from '../common/types.js';
import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';

import { getUpdateColumns } from '../helpers/update.js';
import { escapeSqlNames } from '../utils/escape.js';

export class SqlConflictClause {
  #state: {
    references: SqlBuilderReferences;
    options: SqlBuilderOptions;
    source: SqlSource;
    schema?: ObjectSchema;
    columns: string[];
    record?: SqlRecord;
  };

  constructor(
    source: SqlSource,
    schema: ObjectSchema | undefined,
    references: SqlBuilderReferences,
    options: SqlBuilderOptions,
    columns: string[],
    record?: SqlRecord
  ) {
    this.#state = {
      source,
      schema,
      references,
      options,
      columns,
      record
    };
  }

  get empty() {
    return !this.#state.columns.length;
  }

  apply(record: SqlRecord) {
    this.#state.record = record;

    return this;
  }

  columns(...columns: string[]) {
    this.#state.columns = columns;

    return this;
  }

  column(column: string) {
    this.#state.columns.push(column);

    return this;
  }

  build(): [string, unknown[]] {
    const { references, options, schema, source, columns, record } = this.#state;

    const clause = [`ON CONFLICT (${escapeSqlNames(columns)}) DO`];
    const variables: unknown[] = [];

    const context = { variables, references, options };

    const updateColumns = record && getUpdateColumns(source, record, schema, context);

    if (updateColumns?.length) {
      clause.push(`UPDATE SET ${updateColumns.join(', ')}`);
    } else {
      clause.push('NOTHING');
    }

    return [clause.join(' '), variables];
  }
}
