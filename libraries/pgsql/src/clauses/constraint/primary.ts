import type { SqlConstraintClause } from './clause';

import { escapeSqlName, escapeSqlNames } from '../../utils/escape';

export class SqlPrimaryKeyConstraintClause {
  #state: {
    constraint: SqlConstraintClause;
    columns: string[];
  };

  constructor(constraint: SqlConstraintClause, columns: string[]) {
    this.#state = {
      columns,
      constraint
    };
  }

  get name() {
    return this.#state.constraint.name;
  }

  columns(columns: string[]) {
    this.#state.columns = columns;

    return this;
  }

  build() {
    const { constraint, columns } = this.#state;

    if (!constraint.building) {
      return constraint.build();
    }

    const clause = ['ADD CONSTRAINT', escapeSqlName(constraint.name), 'PRIMARY KEY', `(${escapeSqlNames(columns)})`];

    return clause.join(' ');
  }
}
