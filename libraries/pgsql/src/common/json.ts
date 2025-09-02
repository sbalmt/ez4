import type { SqlBuilderReferences } from '../builder';
import type { SqlSource } from './source';
import type { SqlOrder } from './types';

import { isAnyObject } from '@ez4/utils';

import { SqlSelectStatement } from '../statements/select';
import { mergeSqlAlias, mergeSqlPath } from '../utils/merge';
import { escapeSqlName, escapeSqlText } from '../utils/escape';
import { SqlOrderClause } from '../clauses/query/order';
import { getUniqueAlias } from '../helpers/alias';
import { SqlColumnReference } from './reference';
import { SqlRawValue } from './raw';

type SqlJsonColumnContext = {
  variables: unknown[];
  references: SqlBuilderReferences;
  parent?: string;
  binary?: boolean;
  alias?: string;
};

export type SqlJsonColumnRecord = {
  [field: string]: undefined | boolean | SqlRawValue | SqlColumnReference | SqlSelectStatement | SqlJsonColumnRecord;
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
    record: SqlJsonColumnRecord;
    references: SqlBuilderReferences;
    order?: SqlOrderClause;
    aggregate: boolean;
    column?: string;
    binary?: boolean;
    alias?: string;
  };

  constructor(record: SqlJsonColumnRecord, source: SqlSource, references: SqlBuilderReferences, options: SqlJsonColumnOptions) {
    const { order, aggregate, column, binary, alias } = options;

    this.#state = {
      order: order ? new SqlOrderClause(source, order) : undefined,
      references,
      source,
      record,
      aggregate,
      column,
      binary,
      alias
    };
  }

  build() {
    const { record, source, references, aggregate, order, column, binary, alias } = this.#state;

    const variables: unknown[] = [];

    const result = getJsonObject(record, {
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

const getJsonObject = (record: SqlJsonColumnRecord, context: SqlJsonColumnContext): string => {
  const { variables, references, parent, binary, alias } = context;

  const fields = [];

  for (const field in record) {
    const value = record[field];

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
