import type { SqlConstraintClause } from './clause';

import { escapeSqlName, escapeSqlNames } from '../../utils/escape';
import { ConstraintAction } from '../types';

export class SqlForeignKeyConstraintClause {
  #state: {
    constraint: SqlConstraintClause;
    delete?: SqlForeignKeyActionClause;
    update?: SqlForeignKeyActionClause;
    targetColumn: string;
    sourceColumns: string[];
    sourceTable: string;
  };

  constructor(constraint: SqlConstraintClause, targetColumn: string, sourceTable: string, sourceColumns: string[]) {
    this.#state = {
      sourceTable,
      sourceColumns,
      targetColumn,
      constraint
    };
  }

  get name() {
    return this.#state.constraint.name;
  }

  columns(columns: string[]) {
    this.#state.sourceColumns = columns;

    return this;
  }

  source(table: string) {
    this.#state.sourceTable = table;

    return this;
  }

  target(column: string) {
    this.#state.targetColumn = column;

    return this;
  }

  delete() {
    if (!this.#state.delete) {
      this.#state.delete = new SqlForeignKeyActionClause(this.#state.constraint);
    }

    return this.#state.delete;
  }

  update() {
    if (!this.#state.update) {
      this.#state.update = new SqlForeignKeyActionClause(this.#state.constraint);
    }

    return this.#state.update;
  }

  build() {
    const { constraint, targetColumn, sourceTable, sourceColumns, ...actions } = this.#state;

    if (!constraint.building) {
      return constraint.build();
    }

    const clause = ['ADD', 'CONSTRAINT', escapeSqlName(constraint.name)];

    clause.push('FOREIGN', 'KEY', `(${escapeSqlName(targetColumn)})`);
    clause.push('REFERENCES', escapeSqlName(sourceTable), `(${escapeSqlNames(sourceColumns)})`);

    const deleteAction = actions.delete?.build();
    const updateAction = actions.update?.build();

    if (deleteAction) {
      clause.push('ON', 'DELETE', deleteAction);
    }

    if (updateAction) {
      clause.push('ON', 'UPDATE', updateAction);
    }

    return clause.join(' ');
  }
}

export class SqlForeignKeyActionClause {
  #state: {
    constraint: SqlConstraintClause;
    action?: ConstraintAction;
  };

  constructor(constraint: SqlConstraintClause) {
    this.#state = {
      constraint
    };
  }

  restrict() {
    this.#state.action = ConstraintAction.Restrict;

    return this;
  }

  cascade() {
    this.#state.action = ConstraintAction.Cascade;

    return this;
  }

  null() {
    this.#state.action = ConstraintAction.Null;

    return this;
  }

  build() {
    const { constraint, action } = this.#state;

    if (!constraint.building) {
      return constraint.build();
    }

    switch (action) {
      case ConstraintAction.Restrict:
        return 'RESTRICT';

      case ConstraintAction.Cascade:
        return 'CASCADE';

      case ConstraintAction.Null:
        return 'SET null';
    }

    return undefined;
  }
}
