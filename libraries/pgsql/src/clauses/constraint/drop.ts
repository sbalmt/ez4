import type { SqlConstraintClause } from './clause';

import { escapeSqlName } from '../../utils/escape';

export class SqlDropConstraintClause {
  #state: {
    constraint: SqlConstraintClause;
    check: boolean;
  };

  constructor(constraint: SqlConstraintClause) {
    this.#state = {
      check: false,
      constraint
    };
  }

  get conditional() {
    return this.#state.check;
  }

  get name() {
    return this.#state.constraint.name;
  }

  existing(check = true) {
    this.#state.check = check;
    return this;
  }

  build() {
    const { constraint, check } = this.#state;

    if (!constraint.building) {
      return constraint.build();
    }

    const clause = ['DROP CONSTRAINT'];

    if (check) {
      clause.push('IF EXISTS');
    }

    clause.push(escapeSqlName(constraint.name));

    return clause.join(' ');
  }
}
