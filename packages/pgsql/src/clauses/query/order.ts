import type { SqlSource } from '../../common/source.js';
import type { SqlOrder } from '../../common/types.js';

import { isEmptyObject } from '@ez4/utils';
import { Order } from '@ez4/database';

import { mergeSqlAlias } from '../../utils/merge.js';
import { escapeSqlName } from '../../utils/escape.js';
import { InvalidColumnOrderError } from '../errors.js';

export class SqlOrderClause {
  #state: {
    source: SqlSource;
    columns: SqlOrder;
  };

  constructor(source: SqlSource, columns: SqlOrder = {}) {
    this.#state = {
      source,
      columns
    };
  }

  get empty() {
    return isEmptyObject(this.#state.columns);
  }

  apply(columns: SqlOrder) {
    this.#state.columns = columns;

    return this;
  }

  build() {
    const { source, columns } = this.#state;

    const orderColumns = [];

    for (const column in columns) {
      const order = columns[column];

      if (order) {
        orderColumns.push(getOrderColumn(column, order, source.alias));
      }
    }

    return `ORDER BY ${orderColumns.join(', ')}`;
  }
}

const getOrderColumn = (column: string, order: Order, alias?: string) => {
  const columnName = mergeSqlAlias(escapeSqlName(column), alias);

  switch (order) {
    case Order.Asc:
      return `${columnName} ASC`;

    case Order.Desc:
      return `${columnName} DESC`;

    default:
      throw new InvalidColumnOrderError(column);
  }
};
