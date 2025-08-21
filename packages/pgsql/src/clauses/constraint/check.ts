import type { SqlFilters } from '../../common/types.js';
import type { SqlConstraintClause } from './clause.js';

import { escapeSqlName } from '../../utils/escape.js';
import { SqlConditions } from '../../operations/conditions.js';
import { MissingClauseError } from '../errors.js';

export class SqlCheckConstraintClause {
  #state: {
    constraint: SqlConstraintClause;
    filters: SqlConditions;
  };

  constructor(constraint: SqlConstraintClause) {
    this.#state = {
      filters: new SqlConditions(undefined, undefined, {}),
      constraint
    };
  }

  get name() {
    return this.#state.constraint.name;
  }

  apply(filters: SqlFilters) {
    this.#state.filters.apply(filters);
    return this;
  }

  build() {
    const { constraint, filters } = this.#state;

    if (!constraint.building) {
      return constraint.build();
    }

    const conditions = filters.build();

    if (!conditions) {
      throw new MissingClauseError();
    }

    const clause = ['ADD', 'CONSTRAINT', escapeSqlName(constraint.name)];

    clause.push('CHECK', `(${conditions[0]})`);

    return clause.join(' ');
  }
}
