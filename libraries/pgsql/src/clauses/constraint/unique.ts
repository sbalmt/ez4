import type { SqlConstraintClause } from './clause';

import { escapeSqlName, escapeSqlNames } from '../../utils/escape';

export class SqlUniqueConstraintClause {
  #state: {
    validate?: boolean;
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

  validate(validate?: boolean) {
    this.#state.validate = validate;

    return this;
  }

  build() {
    const { validate, constraint, columns } = this.#state;

    if (!constraint.building) {
      return constraint.build();
    }

    const clause = ['ADD CONSTRAINT', escapeSqlName(constraint.name), 'UNIQUE', `(${escapeSqlNames(columns)})`];

    if (validate === false) {
      clause.push('NOT', 'VALID');
    }

    return clause.join(' ');
  }
}
