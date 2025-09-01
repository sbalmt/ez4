import type { SqlSource } from './source';

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
