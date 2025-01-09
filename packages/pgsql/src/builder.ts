import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { SqlStatement } from './types/statement.js';
import type { SqlRawGenerator } from './types/raw.js';

import { SqlSelectStatement } from './queries/select.js';
import { SqlInsertStatement } from './queries/insert.js';
import { SqlUpdateStatement } from './queries/update.js';
import { SqlDeleteStatement } from './queries/delete.js';
import { SqlWithClause } from './types/with.js';
import { SqlRaw } from './types/raw.js';

export type SqlBuilderReferences = {
  counter: number;
};

export type SqlBuilderOptions = {
  /**
   * When defined it's invoked for each variable found in the query.
   * @param value Variable value.
   * @param index Variable index.
   * @param schema Variable schema (if a schema was defined).
   * @returns It must returns the prepared variable value.
   */
  onPrepareVariable?: (value: unknown, index: number, schema?: AnySchema) => unknown;
};

export class SqlBuilder {
  #options: SqlBuilderOptions;

  #references: SqlBuilderReferences = {
    counter: 0
  };

  constructor(options?: SqlBuilderOptions) {
    this.#options = options ?? {};
  }

  raw(value: unknown | SqlRawGenerator) {
    return new SqlRaw(undefined, value);
  }

  reset() {
    this.#references.counter = 0;

    return this;
  }

  with(statements: SqlStatement[], alias?: string) {
    return new SqlWithClause(statements, alias);
  }

  select(schema?: ObjectSchema) {
    return new SqlSelectStatement(schema, this.#references, this.#options);
  }

  insert(schema?: ObjectSchema) {
    return new SqlInsertStatement(schema, this.#references, this.#options);
  }

  update(schema?: ObjectSchema) {
    return new SqlUpdateStatement(schema, this.#references, this.#options);
  }

  delete(schema?: ObjectSchema) {
    return new SqlDeleteStatement(schema, this.#references, this.#options);
  }
}
