import type { SqlAlterTableClause } from '../table/alter.js';

import { MissingClauseError } from '../errors.js';
import { SqlPrimaryKeyConstraintClause } from './primary.js';
import { SqlForeignKeyConstraintClause } from './foreign.js';
import { SqlUniqueConstraintClause } from './unique.js';
import { SqlDropConstraintClause } from './drop.js';

export class SqlConstraintClause {
  #state: {
    table: SqlAlterTableClause;
    clause?: SqlPrimaryKeyConstraintClause | SqlForeignKeyConstraintClause | SqlUniqueConstraintClause | SqlDropConstraintClause;
    building?: boolean;
    name: string;
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

  foreign(source: string, target: string, columns: string[]) {
    const { clause } = this.#state;

    if (!(clause instanceof SqlForeignKeyConstraintClause)) {
      this.#state.clause = new SqlForeignKeyConstraintClause(this, source, target, columns);
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

  drop() {
    const { clause, table, name } = this.#state;

    if (!(clause instanceof SqlDropConstraintClause)) {
      this.#state.clause = new SqlDropConstraintClause(table, name);
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
