import type { SqlSource } from './source.js';

import { isAnyObject } from '@ez4/utils';

import { mergeSqlAlias, mergeSqlPath } from '../utils/merge.js';
import { escapeSqlName, escapeSqlText } from '../utils/escape.js';
import { SqlSelectStatement } from '../queries/select.js';
import { SqlReference } from './reference.js';
import { SqlRawValue } from './raw.js';

type SqlJsonColumnContext = {
  variables: unknown[];
  parent?: string;
  alias?: string;
};

export type SqlJsonColumnSchema = {
  [field: string]:
    | undefined
    | boolean
    | SqlRawValue
    | SqlReference
    | SqlSelectStatement
    | SqlJsonColumnSchema;
};

export type SqlJsonColumnOptions = {
  aggregate: boolean;
  column?: string;
  alias?: string;
};

export class SqlJsonColumn {
  #state: {
    schema: SqlJsonColumnSchema;
    source: SqlSource;
    aggregate: boolean;
    column?: string;
    alias?: string;
  };

  constructor(
    schema: SqlJsonColumnSchema,
    source: SqlSource,
    aggregate: boolean,
    column?: string,
    alias?: string
  ) {
    this.#state = {
      source,
      schema,
      aggregate,
      column,
      alias
    };
  }

  build() {
    const { source, aggregate, schema, alias, column } = this.#state;

    const variables: unknown[] = [];

    const result = getJsonObject(schema, {
      ...(column && { parent: escapeSqlName(column) }),
      alias: source.alias,
      variables
    });

    const jsonResult = aggregate ? `COALESCE(json_agg(${result}), '[]'::json)` : result;
    const jsonColumn = alias ?? column;

    if (jsonColumn) {
      return [`${jsonResult} AS ${escapeSqlName(jsonColumn)}`, variables];
    }

    return [jsonResult, variables];
  }
}

const getJsonObject = (schema: SqlJsonColumnSchema, context: SqlJsonColumnContext): string => {
  const { variables, parent, alias } = context;

  const fields = [];

  for (const field in schema) {
    const value = schema[field];

    if (!value) {
      continue;
    }

    const columnName = mergeSqlPath(field, parent);

    if (value instanceof SqlRawValue || value instanceof SqlReference) {
      fields.push(`${escapeSqlText(field)}, ${value.build()}`);
      continue;
    }

    if (value instanceof SqlSelectStatement) {
      const [selectStatement, selectVariables] = value.as(value.filters ? `T` : undefined).build();

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

  return `json_build_object(${fields.join(', ')})`;
};
