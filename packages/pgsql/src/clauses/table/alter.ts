import type { SqlTableStatement } from '../../statements/table.js';

import { escapeSqlName } from '../../utils/escape.js';
import { MissingClauseError, TooManyClausesError } from '../errors.js';
import { SqlConstraintClause } from '../constraint/clause.js';
import { SqlAddColumnClause } from '../column/add.js';
import { SqlAlterColumnClause } from '../column/alter.js';
import { SqlRenameColumnClause } from '../column/rename.js';
import { SqlDropColumnClause } from '../column/drop.js';
import { ChangeType } from '../types.js';

export class SqlAlterTableClause {
  #state: {
    table: SqlTableStatement;
    check: boolean;
    change?: ChangeType;
    rename?: SqlRenameColumnClause;
    create: SqlAddColumnClause[];
    modify: (SqlAlterColumnClause | SqlConstraintClause)[];
    remove: SqlDropColumnClause[];
    building?: boolean;
  };

  constructor(table: SqlTableStatement) {
    this.#state = {
      check: false,
      create: [],
      modify: [],
      remove: [],
      table
    };
  }

  get building() {
    return this.#state.building;
  }

  get conditional() {
    return this.#state.check;
  }

  get name() {
    return this.#state.table.name;
  }

  existing(check = true) {
    this.#state.check = check;

    return this;
  }

  rename = (name: string, to: string) => {
    const { change } = this.#state;

    if (change && change !== ChangeType.Rename) {
      throw new TooManyClausesError();
    }

    if (!this.#state.rename) {
      this.#state.rename = new SqlRenameColumnClause(this, name, to);
      this.#state.change = ChangeType.Rename;
    }

    return this.#state.rename;
  };

  add(name: string, type: string) {
    const { change, create } = this.#state;

    if (change && change !== ChangeType.Create) {
      throw new TooManyClausesError();
    }

    this.#state.change = ChangeType.Create;

    const current = create.find((column) => {
      return column instanceof SqlAddColumnClause && column.name === name;
    });

    if (current) {
      return current;
    }

    const column = new SqlAddColumnClause(this, name, type);

    create.push(column);

    return column;
  }

  alter(name: string) {
    const { change, modify } = this.#state;

    if (change && change !== ChangeType.Modify) {
      throw new TooManyClausesError();
    }

    this.#state.change = ChangeType.Modify;

    const current = modify.find((column) => {
      return column instanceof SqlAlterColumnClause && column.name === name;
    });

    if (current) {
      return current as SqlAlterColumnClause;
    }

    const column = new SqlAlterColumnClause(this, name);

    modify.push(column);

    return column;
  }

  drop = (name: string) => {
    const { change, remove } = this.#state;

    if (change && change !== ChangeType.Remove) {
      throw new TooManyClausesError();
    }

    this.#state.change = ChangeType.Remove;

    const current = remove.find((column) => {
      return column instanceof SqlDropColumnClause && column.name === name;
    });

    if (current) {
      return current;
    }

    const column = new SqlDropColumnClause(this, name);

    remove.push(column);

    return column;
  };

  constraint(name: string) {
    const { change, modify } = this.#state;

    if (change && change !== ChangeType.Modify) {
      throw new TooManyClausesError();
    }

    this.#state.change = ChangeType.Modify;

    const current = modify.find((column) => {
      return column instanceof SqlConstraintClause && column.name === name;
    });

    if (current) {
      return current as SqlConstraintClause;
    }

    const constraint = new SqlConstraintClause(this, name);

    modify.push(constraint);

    return constraint;
  }

  build() {
    const { change, table, check } = this.#state;

    const statement = ['ALTER TABLE'];

    if (check) {
      statement.push('IF EXISTS');
    }

    statement.push(escapeSqlName(table.name));

    const clause = change ? this.#state[change] : undefined;

    if (!clause) {
      throw new MissingClauseError();
    }

    this.#state.building = true;

    try {
      if (Array.isArray(clause)) {
        statement.push(clause.map((current) => current.build()).join(', '));
      } else if (clause) {
        statement.push(clause.build());
      }
    } catch (error) {
      throw error;
    } finally {
      this.#state.building = false;
    }

    return statement.join(' ');
  }
}
