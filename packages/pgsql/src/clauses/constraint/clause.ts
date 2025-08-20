import type { SqlAlterTableClause } from '../table/alter.js';

import { MissingClauseError } from '../errors.js';
import { SqlPrimaryKeyConstraintClause } from './primary.js';
import { SqlForeignKeyConstraintClause } from './foreign.js';
import { SqlUniqueConstraintClause } from './unique.js';
import { SqlRenameConstraintClause } from './rename.js';
import { SqlDropConstraintClause } from './drop.js';

export class SqlConstraintClause {
  #state: {
    table: SqlAlterTableClause;
    building?: boolean;
    name: string;
    clause?:
      | SqlPrimaryKeyConstraintClause
      | SqlForeignKeyConstraintClause
      | SqlUniqueConstraintClause
      | SqlRenameConstraintClause
      | SqlDropConstraintClause;
  };

  constructor(table: SqlAlterTableClause, name: string) {
    this.#state = {
      table,
      name
    };
  }

  get name() {
    return this.#state.name;
  }

  get empty() {
    return !this.#state.clause;
  }

  get building() {
    return this.#state.building;
  }

  primary(columns: string[]) {
    const { clause } = this.#state;

    if (!(clause instanceof SqlPrimaryKeyConstraintClause)) {
      this.#state.clause = new SqlPrimaryKeyConstraintClause(this, columns);
    }

    return this.#state.clause as SqlPrimaryKeyConstraintClause;
  }

  foreign(target: string, source: string, columns: string[]) {
    const { clause } = this.#state;

    if (!(clause instanceof SqlForeignKeyConstraintClause)) {
      this.#state.clause = new SqlForeignKeyConstraintClause(this, target, source, columns);
    }

    return this.#state.clause as SqlForeignKeyConstraintClause;
  }

  unique(columns: string[]) {
    const { clause } = this.#state;

    if (!(clause instanceof SqlUniqueConstraintClause)) {
      this.#state.clause = new SqlUniqueConstraintClause(this, columns);
    }

    return this.#state.clause as SqlUniqueConstraintClause;
  }

  rename(name: string) {
    const { clause } = this.#state;

    if (!(clause instanceof SqlRenameConstraintClause)) {
      this.#state.clause = new SqlRenameConstraintClause(this, name);
    }

    return this.#state.clause as SqlRenameConstraintClause;
  }

  drop() {
    const { clause } = this.#state;

    if (!(clause instanceof SqlDropConstraintClause)) {
      this.#state.clause = new SqlDropConstraintClause(this);
    }

    return this.#state.clause as SqlDropConstraintClause;
  }

  build(): string {
    const { table, clause } = this.#state;

    if (!table.building) {
      return table.build();
    }

    if (!clause) {
      throw new MissingClauseError();
    }

    try {
      this.#state.building = true;
      return clause.build();
    } catch (error) {
      throw error;
    } finally {
      this.#state.building = false;
    }
  }
}
