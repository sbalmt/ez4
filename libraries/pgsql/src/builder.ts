import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { SqlRawGenerator } from './common/raw';

import { SqlRawValue, SqlRawOperation } from './common/raw';
import { SqlTableStatement } from './statements/table';
import { SqlIndexStatement } from './statements/index';
import { SqlSelectStatement } from './statements/select';
import { SqlInsertStatement } from './statements/insert';
import { SqlUpdateStatement } from './statements/update';
import { SqlDeleteStatement } from './statements/delete';
import { SqlUnionClause } from './clauses/query/union';
import { SqlWithClause } from './clauses/query/with';
import { getUniqueAlias } from './helpers/alias';
import { escapeSqlText } from './utils/escape';

export type SqlBuilderReferences = {
  aliases: Record<string, number>;
  counter: number;
};

export type SqlVariableContext = {
  /**
   * Variable index number.
   */
  index: number;

  /**
   * Variable schema.
   */
  schema?: AnySchema;

  /**
   * Determines whether the variable is inside a JSON.
   */
  json?: boolean;
};

export type SqlBuilderOptions = {
  /**
   * When defined it's invoked for each variable found in the query.
   * @param value Variable value.
   * @param context Variable context.
   * @returns It must returns the prepared variable value.
   */
  onPrepareVariable?: (value: unknown, context: SqlVariableContext) => unknown;
};

export class SqlBuilder {
  #options: SqlBuilderOptions;

  #references: SqlBuilderReferences = {
    aliases: {},
    counter: 0
  };

  constructor(options?: SqlBuilderOptions) {
    this.#options = options ?? {};
  }

  rawValue(value: unknown | SqlRawGenerator) {
    return new SqlRawValue(value);
  }

  rawString(value: string) {
    return new SqlRawValue(escapeSqlText(value));
  }

  rawOperation(operator: string, value: unknown | SqlRawGenerator) {
    return new SqlRawOperation(operator, value);
  }

  reset() {
    this.#references = {
      aliases: {},
      counter: 0
    };

    return this;
  }

  alias(name: string) {
    return getUniqueAlias(name, this.#references);
  }

  union(statements: (SqlSelectStatement | SqlInsertStatement | SqlUpdateStatement | SqlDeleteStatement)[]) {
    return new SqlUnionClause(statements);
  }

  with(statements: (SqlSelectStatement | SqlInsertStatement | SqlUpdateStatement | SqlDeleteStatement)[], alias?: string) {
    return new SqlWithClause(statements, this.#references, alias);
  }

  table(name: string) {
    return new SqlTableStatement(name);
  }

  index(name: string) {
    return new SqlIndexStatement(name);
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
