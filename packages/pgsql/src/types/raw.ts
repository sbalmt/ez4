import type { SqlSource } from './source.js';

export type SqlRawGenerator = (statement?: SqlSource) => string;

export class SqlRaw {
  #state: {
    source?: SqlSource;
    value: unknown | SqlRawGenerator;
  };

  constructor(source: undefined | SqlSource, value: unknown | SqlRawGenerator) {
    this.#state = {
      source,
      value
    };
  }

  build() {
    const { source, value } = this.#state;

    if (value instanceof Function) {
      return value(source);
    }

    return value;
  }
}
