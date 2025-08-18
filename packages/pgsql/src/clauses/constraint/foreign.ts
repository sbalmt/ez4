import type { SqlConstraintClause } from './clause.js';

import { escapeSqlName, escapeSqlNames } from '../../utils/escape.js';
import { ConstraintAction } from '../types.js';

export class SqlForeignKeyConstraintClause {
  #state: {
    constraint: SqlConstraintClause;
    delete?: SqlForeignKeyActionClause;
    update?: SqlForeignKeyActionClause;
    sourceColumn: string;
    targetColumns: string[];
    targetTable: string;
  };

  constructor(constraint: SqlConstraintClause, sourceColumn: string, targetTable: string, targetColumns: string[]) {
    this.#state = {
      targetTable,
      targetColumns,
      sourceColumn,
      constraint
    };
  }

  get name() {
    return this.#state.constraint.name;
  }

  columns(columns: string[]) {
    this.#state.targetColumns = columns;

    return this;
  }

  target(table: string) {
    this.#state.targetTable = table;

    return this;
  }

  source(column: string) {
    this.#state.sourceColumn = column;

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
    const { constraint, sourceColumn, targetTable, targetColumns, ...actions } = this.#state;

    if (!constraint.building) {
      return constraint.build();
    }

    const clause = [
      'ADD CONSTRAINT',
      escapeSqlName(constraint.name),
      'FOREIGN KEY',
      `(${escapeSqlName(sourceColumn)})`,
      'REFERENCES',
      escapeSqlName(targetTable),
      `(${escapeSqlNames(targetColumns)})`
    ];

    const deleteAction = actions.delete?.build();
    const updateAction = actions.update?.build();

    if (deleteAction) {
      clause.push('ON DELETE', deleteAction);
    }

    if (updateAction) {
      clause.push('ON UPDATE', updateAction);
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
