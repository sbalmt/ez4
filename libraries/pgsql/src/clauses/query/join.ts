import type { ObjectSchema } from '@ez4/schema';
import type { SqlBuilderOptions, SqlBuilderReferences } from '../../builder';
import type { SqlResults } from '../../common/results';
import type { SqlFilters } from '../../common/types';

import { escapeSqlName } from '../../utils/escape';
import { SqlConditions } from '../../operations/conditions';
import { SqlTableReference } from '../../common/reference';
import { SqlSource } from '../../common/source';

const enum JoinType {
  Full = 'FULL',
  Inner = 'INNER',
  Left = 'LEFT',
  Right = 'RIGHT',
  Cross = 'CROSS'
}

export class SqlJoin extends SqlSource {
  #state: {
    options: SqlBuilderOptions;
    references: SqlBuilderReferences;
    schema?: ObjectSchema;
    table: string | SqlTableReference;
    results?: SqlResults;
    on?: SqlConditions;
    alias?: string;
    natural?: boolean;
    type: JoinType;
  };

  constructor(
    table: string | SqlTableReference,
    schema: ObjectSchema | undefined,
    references: SqlBuilderReferences,
    options: SqlBuilderOptions
  ) {
    super();

    this.#state = {
      type: JoinType.Inner,
      references,
      options,
      schema,
      table
    };
  }

  get filters() {
    return this.#state.on;
  }

  get alias() {
    return this.#state.alias;
  }

  get results() {
    return this.#state.results;
  }

  get schema() {
    return this.#state.schema;
  }

  as(alias: string | undefined) {
    this.#state.alias = alias;
    return this;
  }

  full() {
    this.#state.type = JoinType.Full;
    return this;
  }

  inner() {
    this.#state.type = JoinType.Inner;
    return this;
  }

  left() {
    this.#state.type = JoinType.Left;
    return this;
  }

  right() {
    this.#state.type = JoinType.Right;
    return this;
  }

  natural(natural = true) {
    this.#state.natural = natural;
    return this;
  }

  cross() {
    this.#state.type = JoinType.Cross;
    return this;
  }

  on(filters: SqlFilters) {
    const { on, references, options } = this.#state;

    if (!on) {
      this.#state.on = new SqlConditions(this, references, options, filters);
    } else if (filters) {
      on.apply(filters);
    }

    return this;
  }

  build(): [string, unknown[]] {
    const { table, alias, natural, type, on } = this.#state;

    const variables = [];
    const clause = [];

    if (natural) {
      clause.push('NATURAL');
    }

    clause.push(type, 'JOIN');

    if (table instanceof SqlTableReference) {
      clause.push(table.build());
    } else {
      clause.push(escapeSqlName(table));
    }

    if (alias) {
      clause.push(`AS ${escapeSqlName(alias)}`);
    }

    if (!natural && type !== JoinType.Cross) {
      const result = on?.build();
      clause.push('ON');

      if (!result) {
        clause.push('TRUE');
      } else {
        const [onConditions, onVariables] = result;

        variables.push(...onVariables);
        clause.push(onConditions);
      }
    }

    return [clause.join(' '), variables];
  }
}
