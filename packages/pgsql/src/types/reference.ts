import type { SqlSource } from './source.js';

import { MissingTableAliasError } from '../errors/queries.js';
import { escapeSqlName } from '../utils/escape.js';
import { mergeSqlAlias } from '../utils/merge.js';

export type SqlReferenceGenerator = (source: SqlSource) => string;

export class SqlTableReference {
  #state: {
    source: SqlSource;
  };

  constructor(source: SqlSource) {
    this.#state = {
      source
    };
  }

  build() {
    const { source } = this.#state;

    if (source.alias) {
      return escapeSqlName(source.alias);
    }

    throw new MissingTableAliasError();
  }
}

export class SqlColumnReference {
  #state: {
    source: SqlSource;
    column: string | SqlReferenceGenerator;
  };

  constructor(source: SqlSource, column: string | SqlReferenceGenerator) {
    this.#state = {
      source,
      column
    };
  }

  build() {
    const { source, column } = this.#state;

    if (column instanceof Function) {
      return column(source);
    }

    if (source.alias) {
      return mergeSqlAlias(escapeSqlName(column), source.alias);
    }

    return escapeSqlName(column);
  }
}
