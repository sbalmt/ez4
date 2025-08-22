import type { SqlConstraintClause } from './clause.js';

import { escapeSqlName } from '../../utils/escape.js';

export class SqlRenameConstraintClause {
  #state: {
    constraint: SqlConstraintClause;
    name: string;
  };

  constructor(constraint: SqlConstraintClause, name: string) {
    this.#state = {
      constraint,
      name
    };
  }

  to(name: string) {
    this.#state.name = name;
  }

  build() {
    const { constraint, name } = this.#state;

    if (!constraint.building) {
      return constraint.build();
    }

    const clause = ['RENAME', 'CONSTRAINT', escapeSqlName(constraint.name), 'TO', escapeSqlName(name)];

    return clause.join(' ');
  }
}
