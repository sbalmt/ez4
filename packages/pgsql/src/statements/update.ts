import type { AnySchema, ObjectSchema } from '@ez4/schema';
import type { SqlBuilderOptions, SqlBuilderReferences } from '../builder.js';
import type { SqlResultColumn, SqlResultRecord } from '../common/results.js';
import type { SqlSourceWithResults } from '../common/source.js';
import type { SqlFilters, SqlRecord } from '../common/types.js';

import { isDynamicObjectSchema, IsNullishSchema, isObjectSchema, SchemaType } from '@ez4/schema';
import { isPlainObject } from '@ez4/utils';

import { SqlRaw, SqlRawOperation } from '../common/raw.js';
import { SqlReturningClause } from '../clauses/returning.js';
import { SqlColumnReference, SqlTableReference } from '../common/reference.js';
import { MissingTableNameError, MissingRecordError, EmptyRecordError } from '../errors/queries.js';
import { mergeSqlJsonPath, mergeSqlPath } from '../utils/merge.js';
import { InvalidAtomicOperation } from '../errors/operation.js';
import { getFields, getValues } from '../utils/column.js';
import { getTableExpressions } from '../utils/table.js';
import { escapeSqlName } from '../utils/escape.js';
import { SqlWhereClause } from '../clauses/where.js';
import { SqlSource } from '../common/source.js';
import { SqlSelectStatement } from './select.js';

type SqlUpdateContext = {
  options: SqlBuilderOptions;
  references: SqlBuilderReferences;
  variables: unknown[];
  coalesce?: boolean;
  parent?: string;
};

export class SqlUpdateStatement extends SqlSource {
  #state: {
    options: SqlBuilderOptions;
    references: SqlBuilderReferences;
    returning?: SqlReturningClause;
    source?: SqlTableReference | SqlSource;
    schema?: ObjectSchema;
    record?: SqlRecord;
    where?: SqlWhereClause;
    table?: string;
    alias?: string;
  };

  constructor(schema: ObjectSchema | undefined, references: SqlBuilderReferences, options: SqlBuilderOptions) {
    super();

    this.#state = {
      options,
      references,
      schema
    };
  }

  get fields() {
    return this.#state.record ? getFields(this.#state.record) : [];
  }

  get values() {
    return this.#state.record ? getValues(this.#state.record) : [];
  }

  get filters() {
    return this.#state.where;
  }

  get alias() {
    return this.#state.alias;
  }

  get results() {
    return this.#state.returning?.results;
  }

  get schema() {
    return this.#state.schema;
  }

  only(table: string) {
    this.#state.table = table;

    return this;
  }

  from(table: SqlTableReference | SqlSource | undefined) {
    this.#state.source = table;

    return this;
  }

  as(alias: string | undefined) {
    this.#state.alias = alias;

    return this;
  }

  record(record: SqlRecord) {
    this.#state.record = record;

    return this;
  }

  where(filters?: SqlFilters) {
    const { where, references, options } = this.#state;

    if (!where) {
      this.#state.where = new SqlWhereClause(this, references, options, filters);
    } else if (filters) {
      where.apply(filters);
    }

    return this;
  }

  returning(result?: SqlResultRecord | SqlResultColumn[]) {
    const { returning } = this.#state;

    if (!returning) {
      this.#state.returning = new SqlReturningClause(this, result);
    } else if (result) {
      returning.apply(result);
    }

    return this as SqlUpdateStatement & SqlSourceWithResults;
  }

  build(): [string, unknown[]] {
    const { table, alias, references, options, record, schema, source, where, returning } = this.#state;

    if (!table) {
      throw new MissingTableNameError();
    }

    const statement = [`UPDATE ONLY ${escapeSqlName(table)}`];
    const variables: unknown[] = [];

    if (alias) {
      statement.push(`AS ${escapeSqlName(alias)}`);
    }

    if (!record) {
      throw new MissingRecordError();
    }

    const columns = getUpdateColumns(this, record, schema, {
      variables,
      references,
      options
    });

    if (!columns.length) {
      throw new EmptyRecordError();
    }

    statement.push(`SET ${columns.join(', ')}`);

    if (source) {
      const [tableExpressions, tableVariables] = getTableExpressions([source]);

      statement.push(`FROM ${tableExpressions[0]}`);
      variables.push(...tableVariables);
    }

    if (where && !where.empty) {
      const whereResult = where.build();

      if (whereResult) {
        const [whereClause, whereVariables] = whereResult;

        statement.push(whereClause);
        variables.push(...whereVariables);
      }
    }

    if (returning && !returning.empty) {
      const [returningClause, returningVariables] = returning.build();

      variables.push(...returningVariables);
      statement.push(returningClause);
    }

    return [statement.join(' '), variables];
  }
}

const getUpdateColumns = (source: SqlSource, record: SqlRecord, schema: ObjectSchema | undefined, context: SqlUpdateContext): string[] => {
  const { variables, references, options, coalesce, parent } = context;

  const columns = [];

  const pushUpdate = (fieldName: string, fieldValue: string) => {
    if (!coalesce) {
      columns.push(`${mergeSqlPath(fieldName, parent)} = ${fieldValue}`);
    } else {
      columns.push(`'${fieldName}', ${fieldValue}`);
    }
  };

  for (const fieldName in record) {
    const value = record[fieldName];

    if (value === undefined) {
      continue;
    }

    if (value instanceof SqlColumnReference) {
      pushUpdate(fieldName, value.build());
      continue;
    }

    if (value instanceof SqlSelectStatement) {
      const [selectStatement, selectVariables] = value.build();

      pushUpdate(fieldName, `(${selectStatement})`);
      variables.push(...selectVariables);

      continue;
    }

    const fieldSchema = schema?.properties[fieldName];

    if (isPlainObject(value)) {
      const nextSchema = fieldSchema && isObjectSchema(fieldSchema) ? fieldSchema : undefined;
      const canReplace = nextSchema && isDynamicObjectSchema(nextSchema);

      if (canReplace) {
        const fieldIndex = references.counter++;

        if (options.onPrepareVariable) {
          variables.push(options.onPrepareVariable(value, { schema: nextSchema, index: fieldIndex, json: true }));
        } else {
          variables.push(value);
        }

        pushUpdate(fieldName, `:${fieldIndex}`);
        continue;
      }

      const canCombine = nextSchema && IsNullishSchema(nextSchema);
      const columnName = mergeSqlPath(fieldName, parent);

      const jsonValue = getUpdateColumns(source, value, nextSchema, {
        ...context,
        coalesce: canCombine,
        parent: columnName
      });

      if (canCombine) {
        columns.push(`${columnName} = COALESCE(${columnName}, '{}'::jsonb) || jsonb_build_object(${jsonValue.join(',')})`);
      } else {
        columns.push(...jsonValue);
      }

      continue;
    }

    const fieldValue = value instanceof SqlRaw ? value.build(source) : value;
    const fieldIndex = references.counter++;

    const json = !!parent;

    if (!(value instanceof SqlRawOperation)) {
      pushUpdate(fieldName, `:${fieldIndex}`);
    } else {
      const columnName = mergeSqlJsonPath(fieldName, parent);

      if (!json) {
        pushUpdate(fieldName, `(${columnName} ${value.operator} :${fieldIndex})`);
      } else {
        const lhsOperand = getOperandColumn(fieldSchema, fieldName, coalesce ? getOperandCoalesce(fieldSchema, columnName) : columnName);
        const rhsOperand = getOperandColumn(fieldSchema, fieldName, `:${fieldIndex}`);

        pushUpdate(fieldName, `(${lhsOperand} ${value.operator} ${rhsOperand})::text::jsonb`);
      }
    }

    if (options.onPrepareVariable) {
      variables.push(options.onPrepareVariable(fieldValue, { schema: fieldSchema, index: fieldIndex, json }));
      continue;
    }

    variables.push(fieldValue);
  }

  return columns;
};

const getOperandColumn = (schema: AnySchema | undefined, fieldName: string, fieldExpression: string) => {
  if (schema?.type !== SchemaType.Number) {
    throw new InvalidAtomicOperation(fieldName);
  }

  if (schema.format === 'decimal') {
    return `(${fieldExpression})::dec`;
  }

  return `(${fieldExpression})::int`;
};

const getOperandCoalesce = (schema: AnySchema | undefined, columnName: string) => {
  if (schema?.type === SchemaType.Number) {
    const defaultValue = schema.definitions?.value ?? schema.definitions?.default ?? schema.definitions?.minValue ?? 0;

    return `COALESCE(${columnName}, '${defaultValue}')`;
  }

  return columnName;
};
