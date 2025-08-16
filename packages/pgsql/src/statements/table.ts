import { TooManyClausesError } from '../clauses/errors.js';
import { SqlAlterTableClause } from '../clauses/table/alter.js';
import { SqlCreateTableClause } from '../clauses/table/create.js';
import { SqlRenameTableClause } from '../clauses/table/rename.js';
import { SqlDropTableClause } from '../clauses/table/drop.js';
import { ChangeType } from '../clauses/types.js';

export class SqlTableStatement {
  #state: {
    name: string;
    change?: ChangeType;
    create?: SqlCreateTableClause;
    modify?: SqlAlterTableClause;
    rename?: SqlRenameTableClause;
    remove?: SqlDropTableClause;
  };

  constructor(name: string) {
    this.#state = {
      name
    };
  }

  get name() {
    return this.#state.name;
  }

  create() {
    const { change } = this.#state;

    if (change && change !== ChangeType.Create) {
      throw new TooManyClausesError();
    }

    if (!this.#state.create) {
      this.#state.create = new SqlCreateTableClause(this);
      this.#state.change = ChangeType.Create;
    }

    return this.#state.create;
  }

  rename(name: string) {
    const { change } = this.#state;

    if (change && change !== ChangeType.Rename) {
      throw new TooManyClausesError();
    }

    if (!this.#state.rename) {
      this.#state.rename = new SqlRenameTableClause(this, name);
      this.#state.change = ChangeType.Rename;
    }

    return this.#state.rename;
  }

  drop() {
    const { change } = this.#state;

    if (change && change !== ChangeType.Remove) {
      throw new TooManyClausesError();
    }

    if (!this.#state.remove) {
      this.#state.remove = new SqlDropTableClause(this);
      this.#state.change = ChangeType.Remove;
    }

    return this.#state.remove;
  }

  alter() {
    const { change } = this.#state;

    if (change && change !== ChangeType.Modify) {
      throw new TooManyClausesError();
    }

    if (!this.#state.modify) {
      this.#state.modify = new SqlAlterTableClause(this);
      this.#state.change = ChangeType.Modify;
    }

    return this.#state.modify;
  }

  build() {
    const { change } = this.#state;

    if (change) {
      return this.#state[change]?.build();
    }

    return undefined;
  }
}
