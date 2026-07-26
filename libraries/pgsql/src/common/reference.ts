import type { SqlSource } from './source';

import { escapeSqlName } from '../utils/escape';
import { mergeSqlAlias } from '../utils/merge';
import { MissingTableAliasError } from './errors';

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
    alias?: string;
  };

  constructor(source: SqlSource, column: string | SqlReferenceGenerator, alias?: string) {
    this.#state = {
      source,
      column,
      alias
    };
  }

  build() {
    const { source, column, alias } = this.#state;

    const result =
      column instanceof Function
        ? column(source)
        : source.alias
          ? mergeSqlAlias(escapeSqlName(column), source.alias)
          : escapeSqlName(column);

    if (alias) {
      return `${result} AS ${escapeSqlName(alias)}`;
    }

    return result;
  }
}
