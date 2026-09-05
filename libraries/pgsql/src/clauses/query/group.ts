import type { SqlSource } from '../../common/source';

import { isEmptyObject } from '@ez4/utils';

import { mergeSqlAlias } from '../../utils/merge';
import { escapeSqlName } from '../../utils/escape';

export class SqlGroupClause {
  #state: {
    source: SqlSource;
    columns: string[];
  };

  constructor(source: SqlSource, columns: string[]) {
    this.#state = {
      source,
      columns
    };
  }

  get empty() {
    return isEmptyObject(this.#state.columns);
  }

  apply(columns: string[]) {
    this.#state.columns = columns;
    return this;
  }

  build() {
    const { source, columns } = this.#state;

    if (!columns.length) {
      return '';
    }

    const groupColumns = columns.map((column) => mergeSqlAlias(escapeSqlName(column), source.alias));

    return `GROUP BY ${groupColumns.join(', ')}`;
  }
}
