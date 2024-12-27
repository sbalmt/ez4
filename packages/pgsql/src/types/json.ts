import type { SqlStatement } from './statement.js';

import { escapeName, escapeText, mergeAlias, mergePath } from '../utils.js';
import { SqlColumnReference } from './reference.js';

type SqlJsonColumnState = {
  statement: SqlStatement;
  schema: SqlJsonColumnSchema;
  aggregate: boolean;
  column?: string;
};

export type SqlJsonColumnSchema = {
  [field: string]: undefined | boolean | SqlColumnReference | SqlJsonColumnSchema;
};

export type SqlJsonColumnOptions = {
  aggregate: boolean;
  alias?: string;
};

export class SqlJsonColumn {
  #state: SqlJsonColumnState;

  constructor(state: SqlJsonColumnState) {
    this.#state = state;
  }

  toString() {
    const { statement, aggregate, schema, column } = this.#state;

    const jsonObject = getJsonObject(schema, statement.alias);
    const jsonColumn = aggregate ? `COALESCE(json_agg(${jsonObject}), '[]'::json)` : jsonObject;

    if (column) {
      return `${jsonColumn} AS ${escapeName(column)}`;
    }

    return jsonColumn;
  }
}

const getJsonObject = (schema: SqlJsonColumnSchema, alias?: string, parent?: string): string => {
  const fields = [];

  for (const field in schema) {
    const value = schema[field];

    if (!value) {
      continue;
    }

    const columnName = mergePath(field, parent);

    if (value instanceof SqlColumnReference) {
      fields.push(`${escapeText(field)}, ${value.toString()}`);
      continue;
    }

    if (value instanceof Object) {
      fields.push(`${escapeText(field)}, ${getJsonObject(value, alias, columnName)}`);
      continue;
    }

    fields.push(`${escapeText(field)}, ${mergeAlias(columnName, alias)}`);
  }

  return `json_build_object(${fields.join(', ')})`;
};
