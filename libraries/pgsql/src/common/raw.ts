import type { SqlSource } from './source';

import { escapeSqlName } from '../utils/escape';

export type SqlRawGenerator = (statement?: SqlSource) => string;

export abstract class SqlRaw {
  abstract build(source?: SqlSource): unknown;
}

export class SqlRawValue extends SqlRaw {
  #state: {
    value: unknown | SqlRawGenerator;
  };

  constructor(value: unknown | SqlRawGenerator) {
    super();

    this.#state = {
      value
    };
  }

  build(source?: SqlSource) {
    const { value } = this.#state;

    if (value instanceof Function) {
      return value(source);
    }

    return value;
  }
}

export class SqlRawColumn extends SqlRaw {
  #state: {
    value: unknown | SqlRawGenerator;
    alias?: string;
  };

  constructor(value: unknown | SqlRawGenerator, alias?: string) {
    super();

    this.#state = {
      value,
      alias
    };
  }

  get alias() {
    return this.#state.alias;
  }

  build(source?: SqlSource) {
    const { value, alias } = this.#state;

    const result = value instanceof Function ? value(source) : value;

    if (alias) {
      return `${result} AS ${escapeSqlName(alias)}`;
    }

    return result;
  }
}

export class SqlRawOperation extends SqlRaw {
  #state: {
    operator: string;
    value: unknown | SqlRawGenerator;
  };

  constructor(operator: string, value: unknown | SqlRawGenerator) {
    super();

    this.#state = {
      operator,
      value
    };
  }

  get operator() {
    return this.#state.operator;
  }

  build(source?: SqlSource) {
    const { value } = this.#state;

    if (value instanceof Function) {
      return value(source);
    }

    return value;
  }
}
