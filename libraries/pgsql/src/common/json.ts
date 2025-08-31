import type { SqlBuilderReferences } from '../builder.js';
import type { SqlSource } from './source.js';
import type { SqlOrder } from './types.js';

import { isAnyObject } from '@ez4/utils';

import { SqlSelectStatement } from '../statements/select.js';
import { mergeSqlAlias, mergeSqlPath } from '../utils/merge.js';
import { escapeSqlName, escapeSqlText } from '../utils/escape.js';
import { SqlOrderClause } from '../clauses/query/order.js';
import { getUniqueAlias } from '../helpers/alias.js';
import { SqlColumnReference } from './reference.js';
import { SqlRawValue } from './raw.js';

type SqlJsonColumnContext = {
  variables: unknown[];
  references: SqlBuilderReferences;
  parent?: string;
  binary?: boolean;
  alias?: string;
};

export type SqlJsonColumnSchema = {
  [field: string]: undefined | boolean | SqlRawValue | SqlColumnReference | SqlSelectStatement | SqlJsonColumnSchema;
};

export type SqlJsonColumnOptions = {
  order?: SqlOrder;
  aggregate: boolean;
  column?: string;
  binary?: boolean;
  alias?: string;
};

export class SqlJsonColumn {
  #state: {
    source: SqlSource;
    schema: SqlJsonColumnSchema;
    references: SqlBuilderReferences;
    order?: SqlOrderClause;
    aggregate: boolean;
    column?: string;
    binary?: boolean;
    alias?: string;
  };

  constructor(schema: SqlJsonColumnSchema, source: SqlSource, references: SqlBuilderReferences, options: SqlJsonColumnOptions) {
    const { order, aggregate, column, binary, alias } = options;

    this.#state = {
      order: order ? new SqlOrderClause(source, order) : undefined,
      references,
      source,
      schema,
      aggregate,
      column,
      binary,
      alias
    };
  }

  build() {
    const { schema, source, references, aggregate, order, column, binary, alias } = this.#state;

    const variables: unknown[] = [];

    const result = getJsonObject(schema, {
      ...(column && { parent: escapeSqlName(column) }),
      alias: source.alias,
      references,
      variables,
      binary
    });

    const jsonResult = aggregate ? getJsonArray(result, order) : result;
    const jsonColumn = alias ?? column;

    if (jsonColumn) {
      return [`${jsonResult} AS ${escapeSqlName(jsonColumn)}`, variables];
    }

    return [jsonResult, variables];
  }
}

const getJsonObject = (schema: SqlJsonColumnSchema, context: SqlJsonColumnContext): string => {
  const { variables, references, parent, binary, alias } = context;

  const fields = [];

  for (const field in schema) {
    const value = schema[field];

    if (!value) {
      continue;
    }

    const columnName = mergeSqlPath(field, parent);

    if (value instanceof SqlRawValue || value instanceof SqlColumnReference) {
      fields.push(`${escapeSqlText(field)}, ${value.build()}`);
      continue;
    }

    if (value instanceof SqlSelectStatement) {
      const temporaryAlias = value.filters ? getUniqueAlias('S', references) : undefined;

      const [selectStatement, selectVariables] = value.as(temporaryAlias).build();

      fields.push(`${escapeSqlText(field)}, (${selectStatement})`);
      variables.push(...selectVariables);

      continue;
    }

    if (!isAnyObject(value)) {
      fields.push(`${escapeSqlText(field)}, ${mergeSqlAlias(columnName, alias)}`);
      continue;
    }

    const nestedObject = getJsonObject(value, {
      ...context,
      parent: columnName
    });

    fields.push(`${escapeSqlText(field)}, ${nestedObject}`);
  }

  return `${binary ? 'jsonb' : 'json'}_build_object(${fields.join(', ')})`;
};

const getJsonArray = (value: string, order?: SqlOrderClause) => {
  const expression = [value];

  if (order && !order.empty) {
    expression.push(order.build());
  }

  return `COALESCE(json_agg(${expression.join(' ')}), '[]'::json)`;
};
