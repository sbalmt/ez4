import { TooManyClausesError } from '../clauses/errors';
import { SqlCreateIndexClause } from '../clauses/index/create';
import { SqlRenameIndexClause } from '../clauses/index/rename';
import { SqlDropIndexClause } from '../clauses/index/drop';
import { ChangeType } from '../clauses/types';

export class SqlIndexStatement {
  #state: {
    name: string;
    change?: ChangeType.Create | ChangeType.Rename | ChangeType.Remove;
    create?: SqlCreateIndexClause;
    rename?: SqlRenameIndexClause;
    remove?: SqlDropIndexClause;
  };

  constructor(name: string) {
    this.#state = {
      name
    };
  }

  get name() {
    return this.#state.name;
  }

  create(table: string, columns?: string[]) {
    const { change } = this.#state;

    if (change && change !== ChangeType.Create) {
      throw new TooManyClausesError();
    }

    if (!this.#state.create) {
      this.#state.create = new SqlCreateIndexClause(this, table, columns);
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
      this.#state.rename = new SqlRenameIndexClause(this, name);
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
      this.#state.remove = new SqlDropIndexClause(this);
      this.#state.change = ChangeType.Remove;
    }

    return this.#state.remove;
  }

  build() {
    const { change } = this.#state;

    if (change) {
      return this.#state[change]?.build();
    }

    return undefined;
  }
}
