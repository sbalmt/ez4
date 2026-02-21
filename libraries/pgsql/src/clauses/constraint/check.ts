import type { SqlFilters } from '../../common/types';
import type { SqlConstraintClause } from './clause';

import { escapeSqlName } from '../../utils/escape';
import { SqlConditions } from '../../operations/conditions';
import { MissingClauseError } from '../errors';

export class SqlCheckConstraintClause {
  #state: {
    validate?: boolean;
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

  validate(validate?: boolean) {
    this.#state.validate = validate;

    return this;
  }

  build() {
    const { validate, constraint, filters } = this.#state;

    if (!constraint.building) {
      return constraint.build();
    }

    const conditions = filters.build();

    if (!conditions) {
      throw new MissingClauseError();
    }

    const clause = ['ADD', 'CONSTRAINT', escapeSqlName(constraint.name)];

    clause.push('CHECK', `(${conditions[0]})`);

    if (validate === false) {
      clause.push('NOT', 'VALID');
    }

    return clause.join(' ');
  }
}
