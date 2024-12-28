import type { SqlStatement } from './statement.js';

import { isAnyObject } from '@ez4/utils';

import { escapeSqlName, escapeSqlText } from '../utils/escape.js';
import { mergeSqlAlias, mergeSqlPath } from '../utils/merge.js';
import { SqlReference } from './reference.js';

type SqlJsonColumnContext = {
  parent?: string;
  alias?: string;
};

type SqlJsonColumnState = {
  schema: SqlJsonColumnSchema;
  statement: SqlStatement;
  aggregate: boolean;
  column?: string;
  alias?: string;
};

export type SqlJsonColumnSchema = {
  [field: string]: undefined | boolean | SqlReference | SqlJsonColumnSchema;
};

export type SqlJsonColumnOptions = {
  aggregate: boolean;
  column?: string;
  alias?: string;
};

export class SqlJsonColumn {
  #state: SqlJsonColumnState;

  constructor(
    schema: SqlJsonColumnSchema,
    statement: SqlStatement,
    aggregate: boolean,
    column?: string,
    alias?: string
  ) {
    this.#state = {
      statement,
      schema,
      aggregate,
      column,
      alias
    };
  }

  build() {
    const { statement, aggregate, schema, alias, column } = this.#state;

    const jsonObject = getJsonObject(schema, {
      alias: statement.alias,
      ...(column && { parent: escapeSqlName(column) })
    });

    const jsonColumn = aggregate ? `COALESCE(json_agg(${jsonObject}), '[]'::json)` : jsonObject;
    const columnName = alias ?? column;

    if (columnName) {
      return `${jsonColumn} AS ${escapeSqlName(columnName)}`;
    }

    return jsonColumn;
  }
}

const getJsonObject = (schema: SqlJsonColumnSchema, context: SqlJsonColumnContext): string => {
  const { parent, alias } = context;

  const fields = [];

  for (const field in schema) {
    const value = schema[field];

    if (!value) {
      continue;
    }

    const columnName = mergeSqlPath(field, parent);

    if (value instanceof SqlReference) {
      fields.push(`${escapeSqlText(field)}, ${value.build()}`);
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
