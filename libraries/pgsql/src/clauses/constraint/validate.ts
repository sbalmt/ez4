import type { SqlConstraintClause } from './clause';

import { escapeSqlName } from '../../utils/escape';

export class SqlValidateConstraintClause {
  #state: {
    constraint: SqlConstraintClause;
  };

  constructor(constraint: SqlConstraintClause) {
    this.#state = {
      constraint
    };
  }

  build() {
    const { constraint } = this.#state;

    if (!constraint.building) {
      return constraint.build();
    }

    const clause = ['VALIDATE', 'CONSTRAINT', escapeSqlName(constraint.name)];

    return clause.join(' ');
  }
}
